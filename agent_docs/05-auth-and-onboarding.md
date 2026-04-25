# 05 — Auth & Onboarding
### SUNDO: Project Context Document

---

## Authentication Flow

Sundo uses Firebase Authentication with email/password. The flow is linear and gate-enforced — users cannot skip steps.

```
/register
    │
    ├── User enters: email, password, confirm password
    ├── Firebase creates account (createUserWithEmailAndPassword)
    ├── Firebase sends verification email (sendEmailVerification)
    │
    ▼
/verify-email
    │
    ├── Holding screen: "Check your inbox"
    ├── Polls Firebase Auth (currentUser.emailVerified) every 3 seconds
    ├── User clicks link in email → Firebase marks email as verified
    │
    ▼
/onboarding/role
    │
    ├── User selects: OFW or Consultant
    ├── Cloud Function writes custom claim: { role: 'ofw' | 'consultant' }
    ├── Firestore: creates users/{uid} document with role + status: 'pending_submission'
    │
    ├── [OFW] ──────────────► /onboarding/ofw/step-1
    └── [Consultant] ────────► /onboarding/consultant/step-1
```

### Auth Pages — Field Specs

**`/register`**
| Field | Type | Validation |
|---|---|---|
| Email | Email input | Valid email format, unique in Firebase |
| Password | Password input | Min 8 chars, 1 uppercase, 1 number |
| Confirm Password | Password input | Must match password |

**`/login`**
| Field | Type | Notes |
|---|---|---|
| Email | Email input | |
| Password | Password input | Firebase `signInWithEmailAndPassword` |

> If a user logs in but has not completed onboarding, middleware redirects them to their last incomplete onboarding step (tracked via `onboardingStep` field in Firestore).

---

## OFW Onboarding Flow

4-step wizard. Progress is saved to Firestore after each step so users can resume.

### Step 1 — Personal Information (`/onboarding/ofw/step-1`)

| Field | Type | Validation |
|---|---|---|
| Full Government Name | Text | Required; min 3 words |
| Profile Photo | Image upload | Required; max 5MB; JPEG/PNG |
| Philippine Address — Barangay | Text | Required |
| Philippine Address — City/Municipality | Text | Required |
| Philippine Address — Province | Text | Required |
| Language Preference | Toggle: English / Filipino | Default: English |

### Step 2 — Deployment Information (`/onboarding/ofw/step-2`)

| Field | Type | Validation |
|---|---|---|
| Job Title (Last Position Abroad) | Text | Required |
| Country of Deployment | Searchable dropdown | Required; pre-filtered to Middle East + common OFW destinations |
| Employer Abroad | Text | Required |
| Current Situation | Dropdown | Required; see Situation Status in Section 02 |
| Salary Range | Dropdown | Required; options from Section 02 |
| Monthly Remittance Range | Dropdown | Required; options from Section 02 |

### Step 3 — Interests & Matching (`/onboarding/ofw/step-3`)

| Field | Type | Validation |
|---|---|---|
| Primary Interest(s) | Multi-select (max 2) | Required; drives consultant matching |
| Secondary Interest | Auto-suggested | Optional; based on situation status |

> UI note: When the user selects their situation status in Step 2, Step 3 highlights recommended categories. E.g., `recently_repatriated` pre-highlights "Benefits" and "Reintegration."

### Step 4 — Document Submission (`/onboarding/ofw/step-4`)

| Document | Required | File Types | Max Size |
|---|---|---|---|
| Government-Issued ID (front & back) | ✅ | JPEG, PNG, PDF | 10MB |
| Passport (data page) | ✅ | JPEG, PNG, PDF | 10MB |
| OFW Card / OEC | ✅ | JPEG, PNG, PDF | 10MB |
| Working VISA (last employment) | ✅ | JPEG, PNG, PDF | 10MB |
| Proof of Philippine Address | ✅ | JPEG, PNG, PDF | 10MB |

After submission:
- Files are uploaded to Firebase Storage under `users/{uid}/documents/`
- Firestore `verificationStatus` updated to `documents_submitted`
- User is redirected to `/onboarding/pending`

---

## Consultant Onboarding Flow

4-step wizard, parallel structure to OFW onboarding but with different fields and an additional Stripe Connect step.

### Step 1 — Personal Information (`/onboarding/consultant/step-1`)

| Field | Type | Validation |
|---|---|---|
| Full Government Name | Text | Required; min 3 words |
| Profile Photo | Image upload | Required |
| Job Title / Professional Title | Text | Required; shown on public profile |
| Philippine Address (full) | 3 fields | Required |
| Bio | Textarea | Required; 50–500 characters |
| Years of Experience | Number | Required; 0–50 |
| Languages Spoken | Multi-select | Required; English pre-selected |
| Language Preference (UI) | Toggle | Default: English |

### Step 2 — Expertise & Engagement (`/onboarding/consultant/step-2`)

| Field | Type | Validation |
|---|---|---|
| Areas of Expertise | Multi-select | Required; min 1; from 7 categories |
| Engagement Modes Offered | Checkbox | Required; min 1: Session, Project, or both |

> Tooltip shown per category explaining what kinds of OFWs are matched to it.

### Step 3 — Rates (`/onboarding/consultant/step-3`)

| Field | Type | Validation | Notes |
|---|---|---|---|
| Session Rate (PHP/hour) | Number | Required if offering Session Mode | Min PHP 200; shown on profile |
| Project Rate Range — Min | Number | Required if offering Project Mode | Indicative; e.g., PHP 5,000 |
| Project Rate Range — Max | Number | Required if offering Project Mode | Must be > Min |

> Displayed on profile as: "Session: ₱X/hr" and "Projects: ₱X,000 – ₱X,000"

### Step 4 — Documents & Stripe Connect (`/onboarding/consultant/step-4`)

**Document submission:**

| Document | Required | Notes |
|---|---|---|
| Government-Issued ID | ✅ | |
| Proof of Philippine Address | ✅ | |
| BIR / TIN Document | ✅ | Required for payment processing |
| Professional Credentials | ✅ | At least 1; certificates, diplomas, licenses |
| Proof of Area of Operation | Optional | For on-ground service consultants |

**Stripe Connect Express onboarding:**
After document upload, consultant is prompted to connect their Stripe account:
- Button: "Set Up Payouts with Stripe"
- Clicking generates a Stripe Connect onboarding link via the API: `stripe.accountLinks.create(...)`
- Consultant completes Stripe's hosted KYC flow and is redirected back to Sundo
- On return, `stripeAccountId` and `stripeOnboardingComplete: true` are written to Firestore
- Stripe onboarding can be completed later — it does not block verification submission

After document upload (Stripe optional at this stage):
- `verificationStatus` → `documents_submitted`
- Redirect to `/onboarding/pending`

---

## Verification Holding Screen (`/onboarding/pending`)

This screen is shown to all users who have submitted documents but have not yet been verified.

**Content:**
```
[Sundo Logo]

Salamat, [First Name]! / Thank you, [First Name]!
Your documents are under review.

Our team typically completes verification within 2–3 business days.
You'll receive an email notification once your account is verified.

Here's what we're reviewing:
✅ Government-Issued ID
✅ [Document 2]
✅ [Document 3]
...

[Contact Support]
```

**Behavior:**
- Firestore listener on `users/{uid}.verificationStatus`
- If status changes to `verified` → automatically redirect to `/dashboard` without requiring a refresh
- If status changes to `rejected` → show rejection reason and a "Resubmit Documents" button

---

## Onboarding State Tracking

The `users/{uid}` document tracks onboarding progress:

```ts
interface OnboardingProgress {
  onboardingComplete: boolean;
  onboardingStep: number; // 1–4; last completed step
  roleSelected: boolean;
  documentsSubmitted: boolean;
  stripeOnboardingComplete: boolean; // Consultant only
}
```

Middleware checks `onboardingComplete` before allowing access to `(app)` routes. If false, user is redirected to their last incomplete step.

---

## Post-Verification: First Login

When a user's `verificationStatus` is set to `verified` by an admin:

1. Firebase Cloud Function sends a "You're verified!" email notification
2. Next time the user visits the app (or if they're on `/pending`), the Firestore listener fires
3. User is redirected to `/dashboard` for the first time
4. Dashboard shows a **Welcome modal** with:
   - Their role confirmed
   - A "What to do next" checklist (for OFWs: browse consultants; for Consultants: complete Stripe setup if not done)

---

*← [04 — App Architecture](./04-app-architecture.md) | Next: [06 — Engagement System →](./06-engagement-system.md)*
