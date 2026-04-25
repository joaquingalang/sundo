# 04 — App Architecture
### SUNDO: Project Context Document

---

## Route Architecture (Next.js App Router)

Routes are organized into four route groups, each with its own layout and access rules enforced by `middleware.ts`.

```
app/
├── (marketing)/              # Public — no auth required
│   └── page.tsx              # Landing page
│
├── (auth)/                   # Auth flow — redirects if already logged in
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify-email/page.tsx
│
├── (onboarding)/             # Post-auth, pre-verification — gated by auth only
│   ├── role/page.tsx         # Step 1: Select OFW or Consultant
│   ├── ofw/                  # OFW onboarding steps
│   │   ├── step-1/page.tsx   # Personal info
│   │   ├── step-2/page.tsx   # Deployment info + situation status
│   │   ├── step-3/page.tsx   # Interests + preferences
│   │   └── step-4/page.tsx   # Document submission
│   ├── consultant/           # Consultant onboarding steps
│   │   ├── step-1/page.tsx   # Personal info + bio
│   │   ├── step-2/page.tsx   # Expertise + engagement modes
│   │   ├── step-3/page.tsx   # Rates
│   │   └── step-4/page.tsx   # Document submission + Stripe Connect
│   └── pending/page.tsx      # Verification holding screen
│
├── (app)/                    # Main app — gated by auth + verified status
│   ├── layout.tsx            # Shell: sidebar + topbar
│   ├── dashboard/page.tsx    # Home dashboard (role-aware)
│   │
│   ├── consultants/          # OFW-facing discovery (role: ofw only)
│   │   ├── page.tsx          # Browse + filter consultants
│   │   └── [consultantId]/
│   │       └── page.tsx      # Consultant public profile
│   │
│   ├── book/                 # Booking flow (role: ofw only)
│   │   └── [consultantId]/
│   │       ├── session/page.tsx    # Book a Session Mode engagement
│   │       └── project/page.tsx   # Initiate a Project Mode engagement
│   │
│   ├── engagements/          # All engagement views (both roles)
│   │   ├── page.tsx          # Engagement list
│   │   └── [engagementId]/
│   │       ├── page.tsx           # Engagement overview
│   │       ├── chat/page.tsx      # In-app messaging + Meet link
│   │       ├── milestones/page.tsx # Milestone tracker (Project Mode only)
│   │       └── vault/page.tsx     # Document vault
│   │
│   ├── profile/              # Own profile management
│   │   ├── page.tsx          # View own profile
│   │   └── edit/page.tsx     # Edit profile fields
│   │
│   ├── wallet/page.tsx       # Stripe Connect payout dashboard (consultant)
│   │                         # Payment history + escrow status (ofw)
│   └── settings/page.tsx     # Account settings, language, notifications
│
└── (admin)/                  # Admin panel — gated by role: admin
    ├── layout.tsx
    ├── page.tsx              # Admin dashboard
    └── users/
        ├── page.tsx          # User list with verification controls
        └── [uid]/page.tsx    # Individual user detail + document viewer
```

---

## Middleware Access Control

`middleware.ts` runs on every request and enforces the following rules:

```ts
// Route protection matrix
const rules = {
  '/':                   'public',
  '/login':             'public — redirect to /dashboard if authed',
  '/register':          'public — redirect to /dashboard if authed',
  '/verify-email':      'auth required — no role check',
  '/onboarding/*':      'auth required — no verified check',
  '/dashboard':         'auth + verified required',
  '/consultants/*':     'auth + verified + role:ofw',
  '/book/*':            'auth + verified + role:ofw',
  '/engagements/*':     'auth + verified + role:ofw|consultant',
  '/profile/*':         'auth + verified',
  '/wallet':            'auth + verified',
  '/settings':          'auth + verified',
  '/admin/*':           'auth + role:admin',
}
```

The middleware reads the Firebase ID token from the session cookie, decodes the custom claims (`role`, `verificationStatus`), and redirects accordingly — all at the Edge, before any page renders.

---

## Firestore Database Schema

### Collection: `users`
Document ID: Firebase Auth UID

```ts
interface UserDocument {
  uid: string;
  email: string;
  role: 'ofw' | 'consultant' | 'admin';
  verificationStatus: 'pending_submission' | 'documents_submitted' | 'under_review' | 'verified' | 'rejected';
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Shared profile fields
  fullName: string;
  profilePhotoUrl?: string;
  philippineAddress: {
    barangay: string;
    cityMunicipality: string;
    province: string;
  };
  languagePreference: 'en' | 'fil';

  // OFW-specific fields
  ofw?: {
    jobTitle: string;
    countryOfDeployment: string;
    employerAbroad: string;
    situationStatus: 'abroad' | 'recently_repatriated' | 'home_1_6mo' | 'home_6mo_plus';
    salaryRange: string;
    monthlyRemittanceRange: string;
    primaryInterests: ConsultationCategory[];
  };

  // Consultant-specific fields
  consultant?: {
    jobTitle: string;
    bio: string;
    expertise: ConsultationCategory[];
    sessionRate: number;
    projectRateRange: string;
    yearsOfExperience: number;
    languagesSpoken: string[];
    engagementModes: ('session' | 'project')[];
    stripeAccountId?: string;
    stripeOnboardingComplete: boolean;
    averageRating?: number;
    totalReviews?: number;
  };
}
```

### Collection: `engagements`
Document ID: auto-generated

```ts
interface EngagementDocument {
  id: string;
  ofwId: string;
  consultantId: string;
  mode: 'session' | 'project';
  category: ConsultationCategory;
  status: EngagementStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Meet link (generated on booking confirmation)
  meetLink?: string;
  meetEventId?: string;

  // Session Mode fields
  session?: {
    scheduledAt: Timestamp;
    durationMinutes: number;
    agreedRate: number;
    platformFee: number;
    totalCharged: number;
  };

  // Project Mode fields
  project?: {
    title: string;
    description: string;
    agreedTotal: number;
    platformFee: number;
    totalCharged: number;
    contractSignedAt?: Timestamp;
    milestones: Milestone[];
  };

  // Payment
  stripePaymentIntentId?: string;
  escrowStatus: 'unfunded' | 'funded' | 'partially_released' | 'fully_released' | 'refunded' | 'disputed';
}

type EngagementStatus =
  | 'pending_acceptance'   // Consultant has not accepted yet
  | 'accepted'             // Consultant accepted, awaiting escrow funding
  | 'escrow_funded'        // Funds locked, work can begin
  | 'in_progress'          // Active engagement
  | 'milestone_submitted'  // Consultant submitted proof, awaiting AI/OFW review
  | 'dispute'              // OFW raised a dispute
  | 'completed'            // OFW marked complete, final payout done
  | 'cancelled';
```

### Sub-collection: `engagements/{id}/messages`

```ts
interface MessageDocument {
  id: string;
  senderId: string;
  senderRole: 'ofw' | 'consultant';
  type: 'text' | 'file' | 'milestone_update' | 'meet_link' | 'system';
  content: string;
  fileUrl?: string;
  fileName?: string;
  milestoneData?: {
    milestoneIndex: number;
    status: 'submitted' | 'approved' | 'rejected';
    label: string;
  };
  createdAt: Timestamp;
}
```

### Sub-collection: `engagements/{id}/vault`

```ts
interface VaultFileDocument {
  id: string;
  uploadedBy: string;
  uploaderRole: 'ofw' | 'consultant';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Timestamp;
  description?: string;
}
```

### Collection: `reviews`
Document ID: `{engagementId}` (one review per engagement)

```ts
interface ReviewDocument {
  engagementId: string;
  consultantId: string;
  ofwId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review: string;
  tags: ReviewTag[];
  createdAt: Timestamp;
  isPublic: true; // Always public on Sundo
}

type ReviewTag =
  | 'Thorough'
  | 'Responsive'
  | 'Knowledgeable'
  | 'Delivered on Time'
  | 'Clear Communication'
  | 'Went Above & Beyond'
  | 'Professional';
```

### Collection: `milestones` (embedded in engagement, shown here for clarity)

```ts
interface Milestone {
  index: 0 | 1 | 2 | 3 | 4;         // 0-indexed, maps to 5 phases
  label: string;                      // Phase name
  deliverable: string;                // Consultant-filled description
  percentageOfTotal: number;          // 15–30 depending on phase
  amountPHP: number;                  // Calculated from agreedTotal
  status: 'locked' | 'active' | 'submitted' | 'ai_reviewing' | 'approved' | 'rejected' | 'paid';
  submittedAt?: Timestamp;
  proofFileUrl?: string;
  proofFileName?: string;
  aiAuditResult?: {
    verdict: 'approved' | 'rejected' | 'manual_review';
    confidence: number;
    reasoning: string;
    auditedAt: Timestamp;
  };
  paidAt?: Timestamp;
  tasks: MilestoneTask[];             // Sub-tasks added by Consultant
}

interface MilestoneTask {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: Timestamp;
}
```

---

## Milestone Phase Definitions

These are pre-filled templates in the Project Mode booking flow. The Consultant fills in the `deliverable` field; percentages are constrained to the defined ranges.

| Phase | Index | Label | % Range | Default % | Trigger |
|---|---|---|---|---|---|
| 1 | 0 | Mobilization & Kick-off | 15–30% | 20% | Contract signing + kick-off meeting held |
| 2 | 1 | Discovery & Assessment | 20–25% | 25% | Audit report / needs analysis submitted & approved |
| 3 | 2 | Strategy & Solution Design | 20–25% | 25% | Blueprint / roadmap / draft plan submitted & approved |
| 4 | 3 | Implementation & Execution | 15–20% | 15% | Training/deployment/execution completed |
| 5 | 4 | Final Turnover & Closure | 10–15% | 15% | Final documentation + 30-day support period ends |

> The percentages must sum to exactly 100%. The UI enforces this constraint with real-time validation before the OFW can fund escrow.

---

## Firestore Security Rules (Summary)

Full rules are in `firestore.rules`. Key principles:

```
users/{uid}:
  - Read: owner (uid match) OR admin
  - Write: owner for profile updates; admin for verificationStatus

users/{uid} — consultant.averageRating, totalReviews:
  - Write: Cloud Function only (after review creation)

engagements/{engagementId}:
  - Read: ofwId match OR consultantId match OR admin
  - Create: role:ofw only
  - Update: ofwId or consultantId depending on field; Cloud Function for status/escrow fields

engagements/{id}/messages/{messageId}:
  - Read/Write: ofwId or consultantId of parent engagement

engagements/{id}/vault/{fileId}:
  - Read: ofwId or consultantId of parent engagement
  - Write: ofwId or consultantId of parent engagement

reviews/{engagementId}:
  - Read: public
  - Create: role:ofw AND engagement.status == 'completed' AND no existing review
  - Update/Delete: never
```

---

*← [03 — Tech Stack](./03-tech-stack.md) | Next: [05 — Auth & Onboarding →](./05-auth-and-onboarding.md)*
