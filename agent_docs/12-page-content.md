# 12 — Page Content Specifications
### SUNDO: Project Context Document

---

## How to Read This Document

Each page entry includes:
- **Route** — the URL path
- **Component Type** — Server Component (SC) or Client Component (CC)
- **Access** — who can see it
- **Purpose** — one-line description
- **Key UI Sections** — what appears on the page
- **Data** — what is fetched and from where
- **Actions** — user interactions and their effects

---

## (marketing) — Public Pages

---

### `/` — Landing Page
**Type:** Server Component | **Access:** Public

**Purpose:** Convert visiting OFWs and potential Consultants into registered users.

**Key UI Sections:**

```
[HERO]
  Headline (EN): "Coming Home Shouldn't Mean Starting From Zero."
  Headline (FIL): "Ang Pag-uwi ay Hindi Simula ng Kawalan."
  Subheadline: "Sundo connects returning OFWs with verified consultants
                who've walked the same path — for business, benefits,
                reintegration, and everything in between."
  CTAs: [Find a Consultant] [Become a Consultant]
  Background: Warm, human photography of Filipino families reuniting

[HOW IT WORKS — 3 steps]
  1. Create your verified account
  2. Book a Consultant matched to your needs
  3. Get guided with your money protected by Sundo Escrow

[CONSULTATION CATEGORIES]
  7 category cards: Business · Work (Local) · General · Benefits ·
  Retirement · Reintegration · Education
  Each with icon, label, and one-line description.

[TRUST INDICATORS]
  • AI-validated milestone delivery
  • Sundo Escrow Vault — funds released only when work is done
  • Verified OFW & Consultant profiles
  • Built for the Filipino reintegration journey

[CRISIS CONTEXT SECTION]
  Headline: "40,000+ OFWs. One platform to guide them home."
  Brief stat-driven description of the Middle East displacement crisis.
  Empathetic, not sensational.

[FOR CONSULTANTS]
  "Turn your experience into income."
  Brief pitch: verified profile, escrow-backed payments, Digital Credibility Score

[FOOTER]
  Logo · About · Contact · Terms of Service · Privacy Policy
  Language toggle: English / Filipino
```

**Data:** Static — no Firestore reads. Stats are hardcoded for MVP.

**Actions:**
- [Find a Consultant] → `/register?intent=ofw`
- [Become a Consultant] → `/register?intent=consultant`
- Language toggle → updates `next-intl` locale in cookie

---

## (auth) — Authentication Pages

---

### `/register` — Registration
**Type:** Client Component | **Access:** Public (redirect to `/dashboard` if authed)

**Key UI Sections:**
```
Sundo logo
"Create your account"
[Email field]
[Password field]  (show/hide toggle)
[Confirm Password field]
[Create Account button]
"Already have an account? Sign in"

— On submit →
  createUserWithEmailAndPassword()
  sendEmailVerification()
  Redirect to /verify-email
```

**Validation (Zod):** Email format · Password min 8 chars, 1 uppercase, 1 number · Passwords match

---

### `/login` — Login
**Type:** Client Component | **Access:** Public

**Key UI Sections:**
```
Sundo logo
"Welcome back"
[Email field]
[Password field]
[Sign In button]
"Forgot password?" → Firebase sendPasswordResetEmail()
"Don't have an account? Register"

— On submit →
  signInWithEmailAndPassword()
  POST /api/auth/session (creates HttpOnly session cookie from ID token)
  Redirect based on user state:
    → onboardingComplete === false → /onboarding/role or last step
    → verificationStatus !== 'verified' → /onboarding/pending
    → verified → /dashboard
```

---

### `/verify-email` — Email Verification Holding Screen
**Type:** Client Component | **Access:** Auth required

**Key UI Sections:**
```
Sundo logo
✉️ icon
"Check your email"
"We sent a verification link to [email]. Click it to continue."
[Resend Email] — calls sendEmailVerification() with cooldown
[I've verified — Continue] — calls currentUser.reload() then checks emailVerified
  → if true: redirect to /onboarding/role
  → if false: show "Email not yet verified" error

Auto-polling: useEffect polls currentUser.reload() every 4 seconds
```

---

## (onboarding) — Onboarding Pages

---

### `/onboarding/role` — Role Selection
**Type:** Client Component | **Access:** Auth + email verified

**Key UI Sections:**
```
"Who are you joining as?"

[Card: I am an OFW]
  Icon: Passport / Globe
  "I'm returning home and need guidance for my next chapter."
  [Select OFW]

[Card: I am a Consultant]
  Icon: Briefcase / Shield
  "I have experience to share and want to guide returning OFWs."
  [Select Consultant]
```

**Actions:**
- On selection:
  1. POST `/api/auth/set-role` — Cloud Function sets custom claim
  2. Create `users/{uid}` Firestore document with `role` + `verificationStatus: 'pending_submission'`
  3. Redirect to `/onboarding/ofw/step-1` or `/onboarding/consultant/step-1`

---

### `/onboarding/ofw/step-1` — OFW Personal Info
**Type:** Client Component | **Access:** Auth + role:ofw

**Progress:** Step 1 of 4

**Key UI Sections:**
```
"Tell us about yourself"
[Profile Photo Upload] — drag or click; preview shown after upload
[Full Government Name]
[Barangay]
[City / Municipality]
[Province]
[Language Preference toggle: English / Filipino]
[Continue →]
```

**Actions:** Save to Firestore `users/{uid}` → update `onboardingStep: 1` → navigate to step-2

---

### `/onboarding/ofw/step-2` — OFW Deployment Info
**Type:** Client Component

**Progress:** Step 2 of 4

**Key UI Sections:**
```
"Tell us about your time abroad"
[Job Title — Last Position Abroad]
[Country of Deployment — searchable dropdown, Middle East pre-filtered]
[Employer Abroad]
[Current Situation — dropdown]
  • Currently abroad, planning to return
  • Recently repatriated (within 30 days)
  • Have been home 1–6 months
  • Have been home 6+ months
[Salary Range — dropdown]
[Monthly Remittance Range — dropdown]
[← Back] [Continue →]
```

---

### `/onboarding/ofw/step-3` — OFW Interests
**Type:** Client Component

**Progress:** Step 3 of 4

**Key UI Sections:**
```
"What do you need help with?"
Subtext: "Select up to 2. This helps us match you with the right consultant."

[Category grid — 7 options, multi-select max 2]
  Each card: Icon + Label + short description
  Cards highlighted based on situationStatus from step 2

  ✦ Business
  ✦ Work (Local)
  ✦ General Consultation
  ✦ Benefits
  ✦ Retirement
  ✦ Reintegration
  ✦ Education

[← Back] [Continue →]
```

---

### `/onboarding/ofw/step-4` — OFW Document Upload
**Type:** Client Component

**Progress:** Step 4 of 4

**Key UI Sections:**
```
"Verify your identity"
"Upload clear photos or scans of the following documents."

[Document upload zones — one per required document]
  Each zone:
    Label + required badge
    Accepted formats: JPEG, PNG, PDF | Max: 10MB
    Drag-and-drop or click to browse
    Upload progress bar
    ✅ Uploaded: [filename] [Remove]

Required documents:
  🪪 Government-Issued ID (front & back)
  📘 Passport (data page)
  🗂️ OFW Card / OEC
  🛂 Working VISA
  🏠 Proof of Philippine Address

[← Back] [Submit Documents →]

— On submit:
  Upload all files to Firebase Storage
  Update Firestore: verificationStatus → 'documents_submitted'
  Redirect to /onboarding/pending
```

---

### `/onboarding/consultant/step-1` — Consultant Personal Info
**Type:** Client Component | **Progress:** Step 1 of 4

```
"Set up your consultant profile"
[Profile Photo Upload]
[Full Government Name]
[Professional Title / Job Title]
[Barangay] [City / Municipality] [Province]
[Bio — textarea, 50–500 chars, live counter]
[Years of Experience — number input]
[Languages Spoken — multi-select: English, Filipino, Bisaya, Ilocano, etc.]
[Language Preference toggle]
[Continue →]
```

---

### `/onboarding/consultant/step-2` — Expertise & Engagement Modes
**Type:** Client Component | **Progress:** Step 2 of 4

```
"What do you specialize in?"
[Category multi-select grid — same 7 categories; min 1 required]
  Each with tooltip explaining the types of OFWs matched

"How would you like to engage?"
[Session Mode checkbox]
  "One-on-one sessions billed by the hour"
[Project Mode checkbox]
  "Structured 5-phase project engagements with milestone payments"

[← Back] [Continue →]
```

---

### `/onboarding/consultant/step-3` — Rates
**Type:** Client Component | **Progress:** Step 3 of 4

```
"Set your rates"

[If Session Mode selected:]
  Session Rate (PHP per hour)
  [Number input — min ₱200]
  "Shown on your public profile. You keep 95%; Sundo's 5% fee is added for the client."

[If Project Mode selected:]
  Project Rate — Minimum (PHP)
  Project Rate — Maximum (PHP)
  "Indicative range shown on your profile. Final project amounts are agreed per engagement."

Live preview:
  "Your profile will show: Session ₱X,XXX/hr · Projects ₱X,XXX – ₱X,XXX"

[← Back] [Continue →]
```

---

### `/onboarding/consultant/step-4` — Documents + Stripe
**Type:** Client Component | **Progress:** Step 4 of 4

```
"Verify your identity and set up payouts"

[Document upload zones]
  🪪 Government-Issued ID (required)
  🏠 Proof of Philippine Address (required)
  📋 BIR / TIN Document (required)
  🎓 Professional Credentials — at least 1 (required)
  📍 Proof of Area of Operation (optional)

[Stripe Connect section]
  "Set up your payout account"
  "Connect with Stripe to receive payments directly to your Philippine bank account."
  [Set Up Payouts with Stripe →] — opens Stripe Connect onboarding URL
  "You can complete this after verification — but you must connect before receiving payments."

[← Back] [Submit Documents →]
```

---

### `/onboarding/pending` — Verification Pending
**Type:** Client Component | **Access:** Auth + documents submitted

```
[Sundo logo]

"Salamat, [First Name]!" / "Thank you, [First Name]!"
"Your documents are under review."

"Our team typically completes verification within 2–3 business days.
 You'll receive an email once your account is verified."

Submitted documents checklist:
  ✅ Government-Issued ID
  ✅ Passport
  ✅ OFW Card / OEC
  [etc — dynamically rendered from what was uploaded]

[Contact Support]

— Firestore onSnapshot listener on users/{uid}.verificationStatus
  → If 'verified': show success toast + redirect to /dashboard
  → If 'rejected': show rejection reason + [Resubmit Documents] button
```

---

## (app) — Main Application Pages

---

### `/dashboard` — Home Dashboard
**Type:** Server Component (shell) + Client Components | **Access:** Verified users only

**OFW Dashboard:**
```
"Maligayang pagbabalik, [First Name]." / "Welcome back, [First Name]."
Situation status badge: "Recently Repatriated"

[Quick Actions]
  [Find a Consultant]   [My Engagements]   [My Wallet]

[Recommended Consultants — 3 cards]
  Based on primaryInterests + situationStatus
  Each: Avatar · Name · Category · Rating · Session rate · [Book]

[Active Engagements — if any]
  List of in-progress engagements with status badges

[What OFWs are getting help with — category stats, decorative]
```

**Consultant Dashboard:**
```
"Good [morning/afternoon], [First Name]."

[Stats row]
  Active Engagements: X
  Pending Requests: X
  This Month's Earnings: ₱X,XXX

[Pending Requests — if any]
  New booking requests awaiting acceptance
  Each: OFW name · Category · Mode · Amount · [Accept] [Decline]

[Active Engagements]
  In-progress projects and sessions with status

[Complete Your Setup — if Stripe not connected]
  ⚠️ Banner: "Connect your payout account to receive payments."
  [Connect Stripe →]
```

**Data (Server Component):**
- `users/{uid}` — profile + role
- `engagements` where `ofwId` or `consultantId` === uid, status in active states
- Recommended consultants query (for OFW): filter by `expertise` matching `primaryInterests`, `verificationStatus: 'verified'`

---

### `/consultants` — Browse Consultants
**Type:** Server Component + Client filters | **Access:** role:ofw + verified

```
"Find your Consultant"
[Search bar: name or keyword]

[Filter bar]
  Category: [All ▾] [Business ▾] [Benefits ▾] ...
  Mode: [All ▾] [Session ▾] [Project ▾]
  Rating: [Any ▾] [4+ stars ▾] [5 stars ▾]
  Sort: [Recommended ▾] [Highest Rated ▾] [Lowest Rate ▾]

[Consultant Grid — 3 columns desktop, 1 column mobile]
  Each ConsultantCard:
    [Profile Photo]  [Verified ✅ badge]
    [Name]
    [Job Title]
    [Category tags: Business · Reintegration]
    [★ 4.8  ·  12 reviews]
    [Session: ₱1,500/hr]  [Projects: ₱10K–₱50K]
    [View Profile]

[Load More] — pagination
```

**Data:** Firestore query on `users` where `role: 'consultant'` + `verificationStatus: 'verified'` with filters applied. Ordered by `averageRating` desc by default.

---

### `/consultants/[consultantId]` — Consultant Public Profile
**Type:** Server Component | **Access:** role:ofw + verified

```
[Cover area — brand gradient]
  [Profile Photo — large]
  [Name]
  [✅ Verified Consultant]
  [Job Title]
  [⭐ 4.8 · 12 reviews]

[About]
  [Bio text]
  [Languages: English · Filipino]
  [Member since: March 2026]
  [Years of experience: 8]

[Specializations]
  [Category badge] [Category badge]

[Engagement Options]
  ┌─────────────────────────────┐  ┌─────────────────────────────┐
  │ 📅 Session Consultation     │  │ 📋 Project Engagement        │
  │ ₱1,500 / hour              │  │ ₱10,000 – ₱50,000           │
  │ General · Benefits · Work  │  │ Business · Reintegration     │
  │ [Book a Session]           │  │ [Start a Project]            │
  └─────────────────────────────┘  └─────────────────────────────┘

[Reviews — public]
  [★★★★★] 5.0 — "Carlo was incredibly thorough..."
  [Tags: Thorough · Delivered on Time]
  — Maria S. · Business Consultation · April 2026

  [★★★★☆] 4.0 — "Very knowledgeable about SSS claims..."
  [Tags: Knowledgeable · Responsive]
  — Jun D. · Benefits · March 2026

  [Load more reviews]
```

**Actions:**
- [Book a Session] → `/book/[consultantId]/session`
- [Start a Project] → `/book/[consultantId]/project`

---

### `/book/[consultantId]/session` — Session Booking
**Type:** Client Component | **Access:** role:ofw + verified

```
"Book a Session with [Consultant Name]"

[Consultant mini-card: photo · name · session rate]

[Topic / Question — textarea]
  "What would you like help with?"
  Max 500 characters

[Preferred Date — date picker]
[Preferred Time — time picker, Manila timezone]
[Duration]
  ○ 30 minutes — ₱750
  ● 60 minutes — ₱1,500
  ○ 90 minutes — ₱2,250

[Order Summary]
  ─────────────────────────
  Consultation (60 min)   ₱1,500
  Platform fee (5%)          ₱75
  ─────────────────────────
  Total                  ₱1,575
  Consultant receives    ₱1,500

"Your payment will be held securely in the Sundo Escrow Vault
 and released only after your session is complete."

[Confirm Booking Request →]
```

**Actions:**
- Creates `engagements/{id}` with `status: 'pending_acceptance'`
- Sends notification to Consultant
- Redirects to `/engagements/[id]` with "Awaiting consultant acceptance" state

---

### `/book/[consultantId]/project` — Project Booking
**Type:** Client Component | **Access:** role:ofw + verified

```
"Start a Project with [Consultant Name]"

[Consultant mini-card]

[Project Title]
[Project Description — textarea, 1000 chars]
[Consultation Category — pre-filtered to consultant's expertise]

[Agreed Project Total (PHP)]
  ₱ [number input]
  "You and the consultant may further negotiate this in chat before escrow is funded."

[Milestone Breakdown Preview]
  As the OFW types the total, the 5 phases auto-calculate:
  ─────────────────────────────────────────────────
  Phase 1: Mobilization (20%)           ₱ 4,000
  Phase 2: Discovery (25%)              ₱ 5,000
  Phase 3: Strategy & Design (25%)      ₱ 5,000
  Phase 4: Implementation (15%)         ₱ 3,000
  Phase 5: Final Closure (15%)          ₱ 3,000
                               Total:  ₱20,000
  ─────────────────────────────────────────────────
  Each row has a % input (within allowed range) — adjustable

[Order Summary]
  Project Total          ₱20,000
  Platform fee (5%)       ₱1,000
  Total to Fund          ₱21,000
  Consultant receives    ₱20,000

[Submit Project Request →]
```

---

### `/engagements` — Engagement List
**Type:** Client Component | **Access:** Both roles + verified

```
"My Engagements"

[Tab filters: All · Active · Completed · Cancelled]

[Engagement cards — list layout]
  Each EngagementCard:
    [Status badge] [Mode badge: Session / Project]
    [Other party: photo + name]
    [Category]
    [Amount: ₱X,XXX]
    [Last activity: 2 hours ago]
    [→ View Engagement]
```

**Data:** Real-time Firestore listener (`useEngagements` hook) filtering by uid.

---

### `/engagements/[engagementId]` — Engagement Overview
**Type:** Client Component | **Access:** Engagement parties only

```
[EngagementHeader]
  [Other party: photo + name + role]
  [Category] [Mode] [Status badge]
  [Escrow: ₱21,000 locked 🔒]

[Navigation tabs]
  [Overview] [Chat] [Milestones — Project only] [Vault]

[Overview tab content:]

  [EscrowVaultCard]
    "Sundo Escrow Vault"
    Total: ₱21,000
    Released: ₱4,000 (Phase 1)
    Remaining: ₱17,000
    [Visual progress bar]

  [Meet Link Card — if available]
    📹 Your Consultation Meeting
    [Date + Time]
    [Join Google Meet ↗]

  [Engagement Details]
    Project Title / Session Topic
    Category · Mode · Created date

  [FOR OFW — Session Mode after session time has passed:]
    "Did your session take place?"
    [✅ Yes, mark complete]  [↩ Reschedule]  [Cancel]

  [FOR OFW — Project Mode, all milestones complete:]
    [✅ Mark Project as Complete]

  [FOR CONSULTANT — pending_acceptance:]
    "New engagement request from [OFW Name]"
    [View Details]
    [✅ Accept]  [❌ Decline]

  [FOR CONSULTANT — accepted, escrow unfunded:]
    "Waiting for OFW to fund escrow..."
    Progress indicator

  [FOR OFW — accepted, escrow unfunded:]
    "Secure your engagement by funding the escrow vault."
    [Stripe payment form]
    [Fund Escrow — ₱21,000 →]
```

---

### `/engagements/[engagementId]/chat` — Chat
**Type:** Client Component | **Access:** Engagement parties, status >= escrow_funded

```
[Chat header: other party name + status badge]

[Message list — scrollable]
  [System card: Escrow Funded]
  [Meet link card]
  [Text bubble — theirs]
  [Text bubble — yours]
  [Milestone update card]
  ...

[Input bar]
  [📎 Attach file]  [Type a message...]  [Send →]
```

**Data:** `useEngagementChat(engagementId)` — real-time Firestore listener.

---

### `/engagements/[engagementId]/milestones` — Milestone Tracker
**Type:** Client Component | **Access:** Engagement parties, Project Mode only

```
[MilestoneTracker]
  [Phase cards — 5 total, vertical stack]

  Phase 1 — Mobilization & Kick-off    [ACTIVE] [20%] [₱4,000]
  ─────────────────────────────────────────────────────────────
  Deliverable: "Conduct kick-off meeting, sign NDA, submit project brief"

  Tasks: [+ Add Task — Consultant only]
    ☑ Schedule and hold kick-off meeting    [Apr 15]
    ☑ Sign service agreement                [Apr 15]
    ☐ Submit initial project brief

  [FOR CONSULTANT — all tasks done:]
    [Submit Milestone →] → ProofSubmissionModal

  Phase 2 — Discovery & Assessment    [LOCKED 🔒] [25%] [₱5,000]
  Phase 3 — Strategy & Solution       [LOCKED 🔒] [25%] [₱5,000]
  Phase 4 — Implementation            [LOCKED 🔒] [15%] [₱3,000]
  Phase 5 — Final Closure             [LOCKED 🔒] [15%] [₱3,000]

  [ProofSubmissionModal — when Submit is tapped]
    "Submit Proof of Work"
    [File upload zone — photo or PDF]
    [Submission note — 200 chars]
    [Submit for Review →]

  [AIAuditResultCard — after submission]
    ✅ Approved / ❌ Rejected / 🔍 Under Manual Review
    + Gemini reasoning
    + Confidence score

  [FOR OFW — after AI approval:]
    [Raise a Dispute] — triggers DisputeModal
    Auto-release countdown: "Payment releases in 5 business days if no action taken"
```

---

### `/engagements/[engagementId]/vault` — Document Vault
**Type:** Client Component | **Access:** Engagement parties

```
"Engagement Vault"
[+ Upload File button — opens file picker]

[VaultFileList]
  [VaultFileCard per file]
    [File type icon]  [filename.pdf]
    Uploaded by [Name] · [Date] · [Size]
    "[Description if provided]"
    [Download ↓]

[Upload modal]
  [File drop zone]
  [Description — optional]
  [Upload →]
```

---

### `/profile` — Own Profile
**Type:** Server Component | **Access:** Verified users

Renders own profile — same layout as public Consultant profile but with an [Edit Profile] button. For OFWs, shows their interests and deployment info instead of services.

---

### `/profile/edit` — Edit Profile
**Type:** Client Component | **Access:** Verified users

Pre-filled form with current profile values. Fields match onboarding forms for the user's role. On save: updates Firestore `users/{uid}`.

Cannot edit: `fullName`, `role`, `verificationStatus` (those require admin action).

---

### `/wallet` — Wallet
**Type:** Client Component | **Access:** Verified users

**OFW view:** (See Section 07 for layout spec)
- Active escrow balances per engagement
- Payment history

**Consultant view:**
- Stripe Express dashboard link
- Pending earnings by engagement
- Paid out this month

---

### `/settings` — Settings
**Type:** Client Component | **Access:** Verified users

```
"Account Settings"

[Notification Preferences]
  Toggle: Email notifications
  Toggle: In-app notifications (future: push)

[Language]
  ○ English
  ● Filipino (Tagalog)

[Security]
  [Change Password] — triggers Firebase sendPasswordResetEmail()

[Account]
  [Sign Out]
  [Delete Account — danger zone, confirmation required]
```

---

## (admin) — Admin Pages

---

### `/admin` — Admin Dashboard
See Section 10 for full spec.

### `/admin/users` — User List
See Section 10 for full spec.

### `/admin/users/[uid]` — User Detail & Verification
See Section 10 for full spec.

---

## First-Login Welcome Modal

Shown once after `verificationStatus` transitions to `verified`. Stored as `hasSeenWelcome: boolean` in Firestore.

**OFW version:**
```
🎉 "You're verified, [Name]!"
"Your Sundo account is ready. Here's how to get started:"
  1. Browse verified Consultants in your area of interest
  2. Book a Session or start a Project
  3. Your payment is always protected by the Sundo Escrow Vault
[Start Browsing Consultants →]
```

**Consultant version:**
```
🎉 "Welcome to Sundo, [Name]!"
"Your profile is now live. Here's what to do next:"
  1. Complete your Stripe payout setup to receive payments
  2. Your profile is visible to verified OFWs — bookings may arrive soon
  3. All payments are escrowed — you'll be notified when funds are secured
[Set Up Stripe Payouts →]  or  [Go to Dashboard →]
```

---

## Error & Empty States

| Page | Empty State | Error State |
|---|---|---|
| `/consultants` | "No consultants found for this filter. Try broadening your search." | "Could not load consultants. Please refresh." |
| `/engagements` | "You have no engagements yet. [Find a Consultant]" (OFW) / "No bookings yet. Your profile is live!" (Consultant) | "Could not load engagements." |
| `/engagements/[id]/chat` | "No messages yet. Say hello!" | "Could not connect to chat." |
| `/engagements/[id]/vault` | "No files uploaded yet. [+ Upload File]" | "Could not load vault." |
| `/wallet` | "No transactions yet." | "Could not load payment data." |

---

*← [11 — Next.js File Structure](./11-nextjs-file-structure.md)*

---

## Document Index

| # | File | Contents |
|---|---|---|
| 01 | `01-executive-summary.md` | Project overview, problem statement, solution pillars |
| 02 | `02-user-roles.md` | OFW & Consultant personas, onboarding fields, document requirements |
| 03 | `03-tech-stack.md` | Full stack with rationale, packages, environment variables |
| 04 | `04-app-architecture.md` | Route map, Firestore schema, security rules |
| 05 | `05-auth-and-onboarding.md` | Auth flow, onboarding steps, verification states |
| 06 | `06-engagement-system.md` | Session & Project modes, milestone lifecycle, chat cards, reviews |
| 07 | `07-payment-system.md` | Stripe Connect Express, escrow vault, fee model, webhooks |
| 08 | `08-ai-integration.md` | Gemini audit flow, prompt engineering, verdict display |
| 09 | `09-communication-system.md` | Chat, Google Meet API, Document Vault, notifications |
| 10 | `10-admin-panel.md` | Admin routes, user list, verification controls |
| 11 | `11-nextjs-file-structure.md` | Complete App Router tree, component/hook/type/store inventory |
| 12 | `12-page-content.md` | Content spec for every page: layout, copy, data, actions |
