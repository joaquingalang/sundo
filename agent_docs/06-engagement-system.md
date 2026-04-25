# 06 — Engagement System
### SUNDO: Project Context Document

---

## Overview

An **Engagement** is the core transactional unit of Sundo. It is the formal relationship between an OFW and a Consultant for a specific consultation need. Every message, payment, document, and milestone lives under an Engagement document in Firestore.

There are two Engagement modes:

| Mode | Best For | Payment Structure | AI Validation |
|---|---|---|---|
| **Session Mode** | General Consultation, Benefits, Work (Local) | Single escrow; released after session | ❌ Not used |
| **Project Mode** | Business, Reintegration, Retirement, Education | 5-phase milestone escrow | ✅ Per milestone submission |

---

## Engagement Status Lifecycle

Both modes share the same status field. Not all statuses apply to both modes.

```
pending_acceptance          ← OFW submits booking; Consultant notified
    │
    ├── [Consultant declines] ──► cancelled
    │
    ▼
accepted                    ← Consultant accepts; OFW prompted to fund escrow
    │
    ▼
escrow_funded               ← Stripe PaymentIntent captured; Consultant notified
    │
    ▼
in_progress                 ← Active engagement; chat open; Meet link available
    │
    ├── [Session Mode] ──────────────────────────────────────────────────────►
    │       │
    │       ├── OFW marks session complete
    │       ▼
    │   completed ──► Review prompt ──► Payout to Consultant
    │
    └── [Project Mode] ─────────────────────────────────────────────────────►
            │
            ├── Milestone 0 active → Consultant adds tasks → Submits proof
            ▼
        milestone_submitted     ← Proof uploaded; Gemini AI audit begins
            │
            ├── [AI: approved] ──► Partial payout ──► Next milestone unlocked
            ├── [AI: rejected] ──► OFW alerted; funds remain locked
            ├── [AI: manual_review] ──► Admin reviews; decision made
            │
            ├── [OFW disputes within 5 days] ──► dispute ──► Admin escalation
            ├── [5 business days, no response] ──► auto-release ──► next milestone
            │
            └── [Milestone 4 complete] ──► OFW marks project complete
                    │
                    ▼
                completed ──► Review prompt ──► Final payout to Consultant
```

---

## Session Mode — Detailed Flow

### Booking (`/book/[consultantId]/session`)

1. OFW selects a Consultant whose profile shows "Session Mode available"
2. OFW fills in:
   - **Topic / Question** (text area, 500 chars max) — what they need help with
   - **Preferred date and time** — simple date/time picker (no calendar integration in MVP)
   - **Duration** — 30 min / 60 min / 90 min
3. System calculates:
   ```
   Subtotal = sessionRate × (duration / 60)
   Platform fee = Subtotal × 0.05
   Total charged to OFW = Subtotal + Platform fee
   Consultant receives = Subtotal
   ```
4. OFW reviews the summary and submits — Engagement document created with status `pending_acceptance`

### Acceptance & Escrow Funding

1. Consultant receives in-app notification + email: "New session request from [OFW Name]"
2. Consultant views request in `/engagements` and accepts or declines
3. On acceptance:
   - Engagement status → `accepted`
   - OFW receives notification: "Your session has been accepted. Secure your session by funding the escrow."
4. OFW visits engagement detail page — shown a Stripe payment form
5. OFW pays → `PaymentIntent` created and captured
6. Engagement status → `escrow_funded`
7. Google Meet link generated (Cloud Function) and stored on the engagement
8. Both parties receive the Meet link in chat as a system card

### Session Completion

1. After the scheduled time, the OFW is prompted: **"Did your session happen?"**
   - Yes → Engagement status → `completed` → escrow released to Consultant → Review prompt shown
   - No → Options: Reschedule (updates scheduled time) or Cancel (Stripe Refund issued)
2. Consultant payout: Stripe Transfer created for the subtotal amount minus platform fee

---

## Project Mode — Detailed Flow

### Booking (`/book/[consultantId]/project`)

1. OFW selects a Consultant whose profile shows "Project Mode available"
2. OFW fills in:
   - **Project Title** (e.g., "Help me register a sari-sari store in Bulacan")
   - **Project Description** (1,000 chars max)
   - **Consultation Category** (pre-selected based on Consultant expertise)
   - **Agreed Total (PHP)** — proposed budget; Consultant can counter-propose in chat
3. Engagement created with status `pending_acceptance`
4. OFW reviews the 5-milestone template with their agreed total distributed:

```
Phase 1: Mobilization (20%) = ₱X,XXX   ← editable within 15–30% range
Phase 2: Discovery (25%)    = ₱X,XXX   ← editable within 20–25% range
Phase 3: Strategy (25%)     = ₱X,XXX   ← editable within 20–25% range
Phase 4: Execution (15%)    = ₱X,XXX   ← editable within 15–20% range
Phase 5: Closure (15%)      = ₱X,XXX   ← editable within 10–15% range
                              ─────────
Total:                        ₱XX,XXX  [Must equal agreed total]
```

5. Consultant fills in the **deliverable description** for each phase after acceptance

### Acceptance & Contract Signing

1. Consultant accepts the engagement
2. Both parties are shown the **Engagement Contract** — a summary of:
   - Project details
   - 5-phase milestone breakdown with amounts
   - Consultant's deliverable descriptions
   - Platform terms (NDA is implicitly enforced by Sundo's Terms of Service)
3. OFW taps **"Sign & Fund Escrow"** — this is the trigger for Phase 1 (Mobilization)
4. Stripe PaymentIntent created for the full project amount
5. Engagement status → `escrow_funded`
6. Google Meet link generated for the kick-off meeting
7. Phase 1 is marked `active`; all subsequent phases are `locked`

### Milestone Execution Cycle (Per Phase)

#### Step 1: Consultant Adds Tasks
In the Milestones tab (`/engagements/[id]/milestones`), the Consultant adds specific local tasks under the active milestone:

```
Phase 1 — Mobilization & Kick-off
  Tasks:
  ☐ Schedule and hold kick-off meeting with client
  ☐ Sign NDA / service agreement
  ☐ Submit initial project brief
```

Task completion is tracked in real-time. Completed tasks appear in the chat as an **Interactive Progress Card** (message type: `milestone_update`).

#### Step 2: Consultant Submits Proof of Work
When all tasks are complete, the Consultant taps **"Submit Milestone"**:
- Required: upload **Proof of Work** document(s) (photo, PDF, or image of deliverable)
- Required: brief submission note (200 chars)
- Engagement status → `milestone_submitted`
- AI audit begins immediately (Cloud Function triggers Gemini)

#### Step 3: AI Audit (Gemini)
See Section 08 for full AI spec. Outcome:

| Result | Action |
|---|---|
| `approved` | Partial payout released; next milestone unlocked; OFW notified |
| `rejected` | Funds remain locked; OFW alerted with AI reasoning; Consultant can resubmit |
| `manual_review` | Admin notified; no auto-action; both parties notified of manual review |

#### Step 4: Dispute Timer
If the OFW does not respond to an approved milestone within **5 business days**:
- A Cloud Function auto-releases the funds to the Consultant
- OFW is notified: "Milestone payment was automatically released after 5 business days of no response."

#### Step 5: OFW Dispute Option
At any point after a milestone submission, the OFW can tap **"Raise a Dispute"**:
- Engagement status → `dispute`
- Funds locked; no auto-release while in dispute
- Admin is notified in the Admin Panel
- Both parties can submit evidence (uploaded to the vault)
- Admin makes a final decision: Release funds or issue Refund

### Project Completion

After Phase 5 (Closure) is approved and paid:
1. OFW is prompted: **"Mark this project as complete"**
2. OFW confirms → Engagement status → `completed`
3. Final payout of Phase 5 amount released to Consultant
4. Review & Rating prompt unlocked for OFW

---

## Chat & Milestone Cards

The chat (`/engagements/[id]/chat`) is always available once status is `escrow_funded`. Special message types render as cards:

### Meet Link Card (type: `meet_link`)
```
┌─────────────────────────────────────┐
│ 📹 Your consultation meeting        │
│ Scheduled: [Date] at [Time]         │
│                                     │
│ [Join Google Meet]                  │
└─────────────────────────────────────┘
```

### Milestone Update Card (type: `milestone_update`)
```
┌─────────────────────────────────────┐
│ 📋 Phase 1 — Mobilization           │
│ Status: Submitted for Review        │
│                                     │
│ Completed Tasks:                    │
│ ✅ Kick-off meeting held            │
│ ✅ NDA signed                       │
│ ✅ Project brief submitted          │
│                                     │
│ [View Milestone Details]            │
└─────────────────────────────────────┘
```

### System Card (type: `system`)
Used for escrow events, status changes, and AI audit results:
```
┌─────────────────────────────────────┐
│ 🔒 Escrow Funded                    │
│ ₱XX,XXX secured in Sundo Vault     │
│ Work may now begin.                 │
└─────────────────────────────────────┘
```

---

## Review & Rating System

Triggered only after `status === 'completed'`. OFW-only action.

### Fields

| Field | Type | Notes |
|---|---|---|
| Rating | 1–5 stars | Required |
| Written Review | Textarea | Required; 50–1,000 chars |
| Tags | Multi-select (max 3) | Optional; from predefined tag list |

### Tag Options
`Thorough` · `Responsive` · `Knowledgeable` · `Delivered on Time` · `Clear Communication` · `Went Above & Beyond` · `Professional`

### Display
Reviews appear on the Consultant's public profile page. The Consultant's `averageRating` and `totalReviews` fields in Firestore are updated by a Cloud Function after each new review.

```
[★★★★★] 5.0  ·  12 reviews
"Carlo was incredibly thorough in walking me through the DTI registration..."
Tags: Thorough · Delivered on Time
— Maria S., Business Consultation
```

---

*← [05 — Auth & Onboarding](./05-auth-and-onboarding.md) | Next: [07 — Payment System →](./07-payment-system.md)*
