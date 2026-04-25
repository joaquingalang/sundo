# 03 — Tech Stack
### SUNDO: Project Context Document

---

## Stack Overview

Every technology choice in Sundo is made with three constraints in mind: **MVP speed**, **production-readiness**, and **OFW-context appropriateness** (i.e., mobile-friendly, resilient to variable internet conditions, and affordable to operate).

---

## Frontend

### Next.js 15 (App Router)
- **Why:** App Router enables per-route server components, dramatically reducing client-side JavaScript. This matters for OFW users on mobile data. Nested layouts allow the dashboard shell, sidebar, and auth guard to be defined once and inherited by all child routes.
- **Key patterns used:**
  - `app/` directory with nested route groups: `(auth)`, `(onboarding)`, `(app)`, `(admin)`
  - `middleware.ts` at the root for Firebase token-based route protection
  - Server Components for data-fetching pages (consultant listings, profile pages)
  - Client Components (`'use client'`) for interactive forms, chat, escrow flows

### TypeScript
- Strict mode enabled. All Firestore document shapes are typed via shared interfaces in `src/types/`. This prevents entire categories of bugs when reading/writing Firestore documents.

### Tailwind CSS
- Utility-first. No custom CSS files except for global resets in `globals.css`.
- Custom color tokens defined in `tailwind.config.ts` to reflect Sundo's brand palette:

```ts
// tailwind.config.ts (color tokens)
colors: {
  brand: {
    navy:    '#1A3C5E',  // Primary — trust, authority
    blue:    '#2563EB',  // Accent — action, links
    gold:    '#F59E0B',  // Highlight — OFW warmth
    cream:   '#FEF9F0',  // Background — soft, approachable
    success: '#10B981',  // Verified, released
    danger:  '#EF4444',  // Rejected, disputed
    muted:   '#6B7280',  // Secondary text
  }
}
```

### Lucide React
- Icon library. Used throughout for UI icons (navigation, status indicators, upload icons, etc.).
- Import pattern: `import { ShieldCheck, Briefcase, MessageSquare } from 'lucide-react'`

---

## Backend & Database

### Firebase Authentication
- **Method used:** Email + Password (MVP)
- **Custom claims:** After role selection, a Firebase Cloud Function writes `{ role: 'ofw' | 'consultant' | 'admin' }` as a custom claim on the user's JWT token.
- **Why custom claims over Firestore role check:** Custom claims are embedded in the ID token — the middleware can read them without an extra Firestore fetch on every request, keeping latency low.
- **Email verification:** Firebase's built-in email verification is required before role selection is shown.

### Firestore (NoSQL Database)
- **Why Firestore over a relational DB for MVP:** Zero-schema setup, real-time listeners for chat and engagement status updates, seamless Firebase Auth integration, and generous free tier. The document model maps naturally to the Sundo data shapes.
- **Collections structure:** See Section 04 (App Architecture) for full schema.
- **Security rules:** Every collection has Firestore Security Rules enforcing role-based access. No client can read or write outside their permission scope, regardless of what the frontend does.

### Firebase Storage
- Used for: user-submitted verification documents, profile photos, proof-of-work uploads (milestone deliverables), and document vault files.
- Storage paths follow a structured convention:
  ```
  users/{uid}/documents/{docType}/{filename}
  engagements/{engagementId}/vault/{filename}
  engagements/{engagementId}/milestones/{milestoneId}/proof/{filename}
  ```
- Storage Security Rules mirror Firestore rules — users can only access their own documents and the vault of engagements they are party to.

### Firebase Cloud Functions
- Used for server-side logic that must not run on the client:
  - Writing custom claims after role selection
  - Triggering Google Meet link generation on booking confirmation
  - Initiating Gemini AI audit when a milestone is submitted
  - Releasing Stripe escrow after AI validation passes
  - Sending dispute timer countdown and auto-release logic

---

## Payments

### Stripe Connect Express
- **Why Express over Standard:** In Express mode, Stripe handles the consultant's full KYC onboarding, identity verification, payout dashboard, and tax form generation. The consultant is redirected to a Stripe-hosted onboarding flow and returns to Sundo with a connected account ID stored in Firestore. This eliminates the need to build a separate payout management UI in the MVP.
- **Why not Standard:** Standard requires consultants to have existing Stripe accounts. Most Filipino consultants on this platform will not have one.

### Escrow Vault Logic (Stripe Connect Charge Flow)

```
OFW pays → PaymentIntent created with application_fee_amount
         → Funds captured to Sundo's Stripe account (not yet transferred)
         → On milestone approval / session completion:
              → Stripe Transfer created to consultant's connected account
              → application_fee_amount is retained by Sundo automatically
```

- **Platform fee:** `PLATFORM_FEE_PERCENT = 0.05` (5%) — defined in `src/config/stripe.ts`
- **The "vault" is conceptual:** Funds are held in Sundo's Stripe balance until transfer is explicitly triggered by a Cloud Function. This is the escrow mechanism.
- **Stripe objects used:** `PaymentIntent`, `Transfer`, `ConnectedAccount`, `Refund` (for dispute resolutions)

> **Note on Philippine regulations:** Stripe is available in the Philippines as of 2024. Consultants receive payouts in PHP to their local bank accounts via Stripe Express. Cross-border payments (for OFWs still abroad) may require additional compliance review before launch.

---

## AI Integration

### Google Gemini API (via direct fetch)
- **Model:** `gemini-1.5-flash` — fast, cost-efficient, multimodal (handles image + text)
- **Use case:** Proof-of-work document validation in Project Mode milestones
- **Integration pattern:** Called from a Firebase Cloud Function (never from the client) to keep the API key server-side

```ts
// Cloud Function pattern
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: auditPrompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64ImageData } }
        ]
      }]
    })
  }
);
```

- **Audit prompt design:** See Section 08 (AI Integration) for full prompt engineering spec.
- **Fallback:** If Gemini returns an ambiguous result or errors out, the milestone goes to manual admin review — it does not auto-reject.

---

## Communication

### In-App Chat (Firestore Real-Time)
- Built on Firestore's real-time `onSnapshot` listeners
- Chat is scoped to a specific `engagement` document — no cross-engagement messaging
- Messages are stored in `engagements/{engagementId}/messages/{messageId}`
- Interactive milestone update cards are a special message type (`type: 'milestone_update'`) rendered differently in the chat UI

### Google Meet API (Programmatic Link Generation)
- **Method:** Google Calendar API with a service account creates a Google Meet-linked calendar event on booking confirmation
- **Flow:**
  1. OFW confirms booking → Cloud Function fires
  2. Function uses a Sundo service account to create a Google Calendar event with `conferenceDataVersion: 1`
  3. Google returns a Meet link (`hangoutLink`)
  4. Link is stored in the `engagement` Firestore document
  5. Link surfaces in the booking detail page and in the chat as an Interactive Card
- **Why a service account and not OAuth per user:** We do not want to require consultants to authorize Google — it adds friction. The Sundo service account hosts the meeting; both parties join as guests.
- **Cost:** Google Meet is free up to the account's plan limits. The service account approach is standard for platform-hosted meeting generation.

---

## State Management

### Zustand
- Used for global client-side state: current user profile, verification status, active engagement, chat messages buffer
- **Why Zustand over Context API:** Less boilerplate, no provider wrapping, works cleanly alongside React Server Components (the store is only initialized in Client Components)
- Store files live in `src/stores/`

```ts
// Example store shape
interface UserStore {
  profile: UserProfile | null;
  role: 'ofw' | 'consultant' | 'admin' | null;
  verificationStatus: VerificationStatus;
  setProfile: (profile: UserProfile) => void;
}
```

---

## Internationalization

### next-intl
- Handles Filipino (Tagalog) and English language support
- Locale files in `src/messages/en.json` and `src/messages/fil.json`
- **Key pages with Filipino translations (MVP):**
  - Landing / Marketing page (`/`)
  - Role selection (`/onboarding/role`)
  - OFW onboarding steps
  - Verification holding screen
  - Dashboard home
- All other pages default to English for MVP; the i18n structure is in place for full translation in a later version.

---

## Infrastructure & Deployment

### Vercel
- Hosts the Next.js application
- Edge middleware runs on Vercel's Edge Runtime for fast route protection
- Environment variables stored in Vercel project settings (never committed to the repo)

### Firebase (Managed)
- Firestore, Auth, Storage, and Cloud Functions are all managed by Firebase — no infrastructure to maintain for the MVP

### Key Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SERVICE_ACCOUNT=   # JSON string, server-side only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=                # Server-side only
STRIPE_WEBHOOK_SECRET=            # Server-side only

# Google
GOOGLE_SERVICE_ACCOUNT_EMAIL=     # For Meet/Calendar API
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

# Gemini
GEMINI_API_KEY=                   # Server-side only

# Daily.co (optional — if switching from Meet)
DAILY_API_KEY=

# Platform Config
PLATFORM_FEE_PERCENT=0.05
DISPUTE_TIMER_DAYS=5
```

---

## Package Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.383.0",
    "firebase": "^11.0.0",
    "firebase-admin": "^12.0.0",
    "stripe": "^16.0.0",
    "@stripe/stripe-js": "^4.0.0",
    "@stripe/react-stripe-js": "^2.0.0",
    "zustand": "^5.0.0",
    "next-intl": "^3.0.0",
    "googleapis": "^140.0.0",
    "date-fns": "^3.0.0",
    "zod": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0"
  }
}
```

---

*← [02 — User Roles](./02-user-roles.md) | Next: [04 — App Architecture →](./04-app-architecture.md)*
