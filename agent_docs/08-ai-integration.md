# 08 — AI Integration
### SUNDO: Project Context Document

---

## Overview

Sundo uses the **Google Gemini API** (`gemini-1.5-flash`) as an objective, automated middleman in the Project Mode milestone release process. When a Consultant submits proof of work for a milestone, Gemini audits the uploaded document(s) before any funds are released.

This is the most critical trust mechanism in the platform. It removes the need for constant human admin oversight of milestone completions while still providing an accountable, explainable validation layer.

---

## Where AI Is Used

| Use Case | Location | Trigger |
|---|---|---|
| **Milestone proof-of-work validation** | Project Mode, per milestone | Consultant taps "Submit Milestone" |
| **Future: Document verification assist** | Onboarding | Structured for integration; not in MVP |

---

## The AI Audit Flow

```
Consultant taps "Submit Milestone"
    │
    ├── Proof file(s) uploaded to Firebase Storage
    ├── Submission note saved to Firestore
    ├── Engagement status → 'milestone_submitted'
    │
    ▼
Cloud Function: onMilestoneSubmitted
    │
    ├── Fetches proof file from Storage (as base64)
    ├── Fetches engagement context from Firestore:
    │   - Consultant full name
    │   - OFW full name
    │   - Milestone label and deliverable description
    │   - Category
    │
    ├── Constructs audit prompt (see below)
    ├── Calls Gemini API
    │
    ▼
Gemini returns structured JSON verdict
    │
    ├── verdict: 'approved'
    │   └── Partial payout triggered (Stripe Transfer)
    │   └── Next milestone unlocked
    │   └── Both parties notified
    │
    ├── verdict: 'rejected'
    │   └── Funds remain locked
    │   └── AI reasoning surfaced to both parties
    │   └── Consultant may resubmit with corrections
    │
    └── verdict: 'manual_review'
        └── Admin notified in Admin Panel
        └── No auto-action taken
        └── Both parties notified: "Under manual review"
```

---

## Audit Prompt Engineering

The prompt is constructed dynamically per milestone. It is sent as a multimodal input: text prompt + base64-encoded image of the submitted proof document.

```ts
// src/lib/ai/auditPrompt.ts

export function buildAuditPrompt(context: AuditContext): string {
  return `
You are an impartial document verification officer for SUNDO, a Filipino consultation platform.
Your job is to verify whether the submitted document is a legitimate proof of work for a 
consulting engagement.

## Engagement Context
- Consultant Name: ${context.consultantName}
- Client (OFW) Name: ${context.ofwName}
- Consultation Category: ${context.category}
- Milestone: ${context.milestoneLabel}
- Required Deliverable: ${context.deliverableDescription}
- Consultant's Submission Note: ${context.submissionNote}

## Your Task
Examine the uploaded document image and determine:
1. Is this a real, legitimate Philippine government document or official business document? (Not a blank form, screenshot of a website, or obviously fake)
2. Does the document match the consultant's name OR the client's name where appropriate?
3. Does the document logically satisfy the stated deliverable for this milestone?
4. Are there any obvious signs of forgery, digital manipulation, or mismatch?

## Response Format
Respond ONLY with a valid JSON object. No preamble, no explanation outside the JSON.

{
  "verdict": "approved" | "rejected" | "manual_review",
  "confidence": 0.0 to 1.0,
  "reasoning": "One to three sentences explaining your decision in plain Filipino or English.",
  "flags": ["list", "of", "specific", "concerns"] // empty array if none
}

## Decision Rules
- "approved": Document is clearly legitimate and satisfies the deliverable. Confidence > 0.80.
- "rejected": Document is clearly illegitimate, mismatched, or does not satisfy the deliverable. Confidence > 0.80.
- "manual_review": You are uncertain, the document is ambiguous, the image quality is too low,
  or your confidence is below 0.80. Do NOT guess. Always escalate uncertainty to manual_review.

## Philippine Document Context
Common legitimate documents include: DTI Certificate, SEC Registration, Mayor's Permit, 
Barangay Business Clearance, BIR Certificate of Registration (COR), PhilHealth / SSS / 
Pag-IBIG certificates, TESDA National Certificates, NBI Clearance, Barangay Clearance,
signed contracts or MOAs with visible letterhead, training completion certificates with 
official seals, signed financial reports on official stationery.
`;
}
```

---

## Gemini API Call (Cloud Function)

```ts
// functions/src/handlers/onMilestoneSubmitted.ts

import * as functions from 'firebase-functions';
import { db, storage } from '../config/firebase';
import { buildAuditPrompt } from '../lib/auditPrompt';

export const onMilestoneSubmitted = functions.firestore
  .document('engagements/{engagementId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    // Only trigger when status changes to 'milestone_submitted'
    if (before.status === after.status) return;
    if (after.status !== 'milestone_submitted') return;

    const activeMilestone = after.project.milestones.find(
      (m: Milestone) => m.status === 'submitted'
    );
    if (!activeMilestone || !activeMilestone.proofFileUrl) return;

    // Fetch proof image from Storage
    const fileRef = storage.bucket().file(activeMilestone.proofStoragePath);
    const [fileBuffer] = await fileRef.download();
    const base64Image = fileBuffer.toString('base64');

    // Build prompt
    const prompt = buildAuditPrompt({
      consultantName: after.consultantName,
      ofwName: after.ofwName,
      category: after.category,
      milestoneLabel: activeMilestone.label,
      deliverableDescription: activeMilestone.deliverable,
      submissionNote: activeMilestone.submissionNote,
    });

    // Call Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }],
          generationConfig: {
            temperature: 0.1,     // Low temperature = more deterministic, less creative
            maxOutputTokens: 512,
          }
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let auditResult: AuditResult;
    try {
      auditResult = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      // Parsing failed — escalate to manual review
      auditResult = {
        verdict: 'manual_review',
        confidence: 0,
        reasoning: 'AI response could not be parsed. Escalated to manual review.',
        flags: ['parse_error']
      };
    }

    // Write audit result to Firestore
    const milestones = after.project.milestones.map((m: Milestone) => {
      if (m.status !== 'submitted') return m;
      return {
        ...m,
        status: auditResult.verdict === 'approved' ? 'approved'
               : auditResult.verdict === 'rejected' ? 'rejected'
               : 'ai_reviewing', // manual_review = stays in reviewing state for admin
        aiAuditResult: {
          ...auditResult,
          auditedAt: new Date().toISOString(),
        }
      };
    });

    await db.collection('engagements').doc(context.params.engagementId).update({
      'project.milestones': milestones,
      status: auditResult.verdict === 'manual_review' ? 'milestone_submitted' : 'in_progress',
      updatedAt: new Date(),
    });

    // Trigger payout if approved
    if (auditResult.verdict === 'approved') {
      // → Calls Stripe Transfer (see Section 07)
      // → Unlocks next milestone
      // → Notifies both parties
    }

    // Notify admin if manual_review
    if (auditResult.verdict === 'manual_review') {
      // → Writes to admin notifications collection
    }
  });
```

---

## AI Audit Result — UI Display

The audit result surfaces in the Engagement Milestones page (`/engagements/[id]/milestones`) and as a chat card.

### Approved
```
┌─────────────────────────────────────────────┐
│ ✅ AI Verification Passed                   │
│ Phase 2 — Discovery & Assessment            │
│                                             │
│ "The submitted Needs Analysis document      │
│  contains official letterhead and client    │
│  name match. Deliverable satisfied."        │
│                                             │
│ Confidence: 94%                             │
│ ₱5,000 released to consultant.             │
│ Phase 3 is now unlocked.                   │
└─────────────────────────────────────────────┘
```

### Rejected
```
┌─────────────────────────────────────────────┐
│ ❌ AI Verification Failed                   │
│ Phase 2 — Discovery & Assessment            │
│                                             │
│ "The uploaded document appears to be a      │
│  blank template without a client name or    │
│  official signature. Does not satisfy the   │
│  stated deliverable."                       │
│                                             │
│ Flags: missing_signature, no_client_name    │
│ Funds remain locked. Consultant may         │
│ resubmit with the correct document.        │
│                                             │
│ [Resubmit Proof]                           │
└─────────────────────────────────────────────┘
```

### Manual Review
```
┌─────────────────────────────────────────────┐
│ 🔍 Under Manual Review                      │
│ Phase 3 — Strategy & Solution Design        │
│                                             │
│ "Document quality was insufficient for      │
│  automated verification. Our team will      │
│  review this within 1–2 business days."     │
│                                             │
│ Funds remain securely locked.              │
└─────────────────────────────────────────────┘
```

---

## Gemini Model Selection Rationale

| Model | Speed | Cost | Multimodal | Why |
|---|---|---|---|---|
| `gemini-1.5-flash` | ✅ Fast | ✅ Cheapest | ✅ Yes | Best for MVP: document images + text, low latency, low cost per audit |
| `gemini-1.5-pro` | Slower | 5–10× more | ✅ Yes | Overkill for document validation; reserve for future complex use cases |
| `gemini-2.0-flash` | ✅ Fastest | ✅ Low | ✅ Yes | Consider upgrading to this post-MVP for improved accuracy |

**Cost estimate:** Gemini 1.5 Flash is approximately $0.075/1M input tokens. A typical audit prompt + image is ~2,000–4,000 tokens. At 1,000 milestone submissions/month, cost is under $1/month.

---

## Future AI Integrations (Post-MVP)

These are scaffolded into the architecture but not built in MVP:

| Feature | Description |
|---|---|
| **Onboarding document pre-check** | Gemini scans uploaded OFW/Consultant documents and flags low-quality images before admin review |
| **Consultation category suggestion** | Gemini analyzes OFW's situation description and suggests the best consultation category |
| **AI-generated session summary** | After a session, Gemini generates a brief summary of discussed topics for both parties' records |
| **Fraud pattern detection** | Gemini flags unusual submission patterns (e.g., same document submitted repeatedly with minor edits) |

---

*← [07 — Payment System](./07-payment-system.md) | Next: [09 — Communication System →](./09-communication-system.md)*
