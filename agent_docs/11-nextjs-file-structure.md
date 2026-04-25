# 11 — Next.js File Structure
### SUNDO: Project Context Document

---

## Overview

This document defines the complete file and folder structure for the Sundo Next.js 15 App Router application. Every file is listed with its purpose, component type (Server/Client), and key exports.

---

## Root Directory

```
sundo/
├── app/                          # Next.js App Router root
├── src/
│   ├── components/               # Shared UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries and API clients
│   ├── stores/                   # Zustand global state stores
│   ├── types/                    # TypeScript interfaces and enums
│   ├── config/                   # App-wide constants and config
│   └── messages/                 # i18n locale strings
├── functions/                    # Firebase Cloud Functions (separate deploy)
│   └── src/
│       ├── config/
│       ├── handlers/
│       └── lib/
├── public/                       # Static assets
├── firestore.rules               # Firestore Security Rules
├── storage.rules                 # Firebase Storage Security Rules
├── firebase.json                 # Firebase project config
├── .env.local                    # Local environment variables (gitignored)
├── middleware.ts                 # Next.js Edge middleware (route protection)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config with brand tokens
└── tsconfig.json
```

---

## `/app` Directory — Full Tree

```
app/
│
├── layout.tsx                    # Root layout: fonts, providers, global styles
├── globals.css                   # Global CSS reset + Tailwind base
│
├── (marketing)/                  # Route group: public landing page
│   └── page.tsx                  # / — Landing page (Server Component)
│
├── (auth)/                       # Route group: authentication
│   ├── layout.tsx                # Centered card layout, no sidebar
│   ├── login/
│   │   └── page.tsx              # /login
│   ├── register/
│   │   └── page.tsx              # /register
│   └── verify-email/
│       └── page.tsx              # /verify-email — polling + instructions
│
├── (onboarding)/                 # Route group: post-auth, pre-verification
│   ├── layout.tsx                # Minimal layout: logo + progress stepper
│   ├── role/
│   │   └── page.tsx              # /onboarding/role — OFW or Consultant choice
│   │
│   ├── ofw/                      # OFW onboarding wizard
│   │   ├── step-1/
│   │   │   └── page.tsx          # Personal info + photo + address
│   │   ├── step-2/
│   │   │   └── page.tsx          # Deployment info + situation status
│   │   ├── step-3/
│   │   │   └── page.tsx          # Primary interests + language preference
│   │   └── step-4/
│   │       └── page.tsx          # Document upload
│   │
│   ├── consultant/               # Consultant onboarding wizard
│   │   ├── step-1/
│   │   │   └── page.tsx          # Personal info + bio + photo
│   │   ├── step-2/
│   │   │   └── page.tsx          # Expertise + engagement modes
│   │   ├── step-3/
│   │   │   └── page.tsx          # Session rate + project rate range
│   │   └── step-4/
│   │       └── page.tsx          # Document upload + Stripe Connect
│   │
│   └── pending/
│       └── page.tsx              # /onboarding/pending — verification holding screen
│
├── (app)/                        # Route group: main authenticated app
│   ├── layout.tsx                # App shell: sidebar + topbar + notification listener
│   │
│   ├── dashboard/
│   │   └── page.tsx              # /dashboard — role-aware home (Server Component)
│   │
│   ├── consultants/              # OFW-only: discover consultants
│   │   ├── page.tsx              # /consultants — browse + filter (Server Component)
│   │   └── [consultantId]/
│   │       └── page.tsx          # /consultants/[id] — public profile (Server Component)
│   │
│   ├── book/                     # OFW-only: booking flows
│   │   └── [consultantId]/
│   │       ├── session/
│   │       │   └── page.tsx      # /book/[id]/session — Session Mode booking
│   │       └── project/
│   │           └── page.tsx      # /book/[id]/project — Project Mode booking
│   │
│   ├── engagements/              # Both roles: engagement management
│   │   ├── page.tsx              # /engagements — list of all engagements
│   │   └── [engagementId]/
│   │       ├── page.tsx          # /engagements/[id] — overview + escrow status
│   │       ├── chat/
│   │       │   └── page.tsx      # /engagements/[id]/chat — real-time messaging
│   │       ├── milestones/
│   │       │   └── page.tsx      # /engagements/[id]/milestones — Project Mode only
│   │       └── vault/
│   │           └── page.tsx      # /engagements/[id]/vault — document vault
│   │
│   ├── profile/
│   │   ├── page.tsx              # /profile — own profile view
│   │   └── edit/
│   │       └── page.tsx          # /profile/edit — edit profile fields
│   │
│   ├── wallet/
│   │   └── page.tsx              # /wallet — escrow status (OFW) / earnings (Consultant)
│   │
│   └── settings/
│       └── page.tsx              # /settings — account, language, notifications
│
├── (admin)/                      # Route group: admin panel
│   ├── layout.tsx                # Admin shell: simple sidebar
│   ├── page.tsx                  # /admin — dashboard with user stats
│   └── users/
│       ├── page.tsx              # /admin/users — user list
│       └── [uid]/
│           └── page.tsx          # /admin/users/[uid] — user detail + verification
│
└── api/                          # Next.js API Routes (server-side only)
    ├── auth/
    │   ├── session/
    │   │   └── route.ts          # POST: create session cookie from Firebase ID token
    │   └── signout/
    │       └── route.ts          # POST: clear session cookie
    ├── stripe/
    │   ├── connect/
    │   │   ├── create-account/
    │   │   │   └── route.ts      # POST: create Stripe Connect Express account
    │   │   └── account-link/
    │   │       └── route.ts      # POST: generate Stripe Connect onboarding link
    │   ├── payment/
    │   │   ├── create-intent/
    │   │   │   └── route.ts      # POST: create PaymentIntent for escrow funding
    │   │   └── release/
    │   │       └── route.ts      # POST: trigger Transfer to consultant (admin/CF only)
    │   └── webhook/
    │       └── route.ts          # POST: Stripe webhook handler
    ├── meet/
    │   └── create/
    │       └── route.ts          # POST: generate Google Meet link (called by CF)
    └── admin/
        └── verify/
            └── route.ts          # POST: update user verificationStatus (admin only)
```

---

## `/src/components` Directory

```
src/components/
│
├── ui/                           # Base UI primitives
│   ├── Button.tsx                # Variant: primary, secondary, ghost, danger
│   ├── Input.tsx                 # Text input with label + error state
│   ├── Textarea.tsx              # Textarea with char counter
│   ├── Select.tsx                # Dropdown select with label
│   ├── Badge.tsx                 # Status badges (verified, pending, etc.)
│   ├── Avatar.tsx                # User profile photo with fallback initials
│   ├── Card.tsx                  # Base card container with variants
│   ├── Modal.tsx                 # Dialog/modal overlay
│   ├── Spinner.tsx               # Loading spinner
│   ├── StarRating.tsx            # 1–5 star input and display component
│   ├── FileUpload.tsx            # Drag-and-drop + click file upload zone
│   ├── ProgressBar.tsx           # Linear progress bar
│   └── Tabs.tsx                  # Tab navigation component
│
├── layout/                       # Layout components
│   ├── AppShell.tsx              # Sidebar + topbar wrapper (Client Component)
│   ├── Sidebar.tsx               # Role-aware navigation sidebar
│   ├── Topbar.tsx                # Top bar: user avatar, notifications bell
│   ├── OnboardingLayout.tsx      # Stepper progress bar for onboarding
│   ├── AuthLayout.tsx            # Centered card for auth pages
│   └── AdminShell.tsx            # Admin panel layout
│
├── auth/                         # Auth-specific components
│   ├── LoginForm.tsx             # Email + password login form (Client)
│   ├── RegisterForm.tsx          # Registration form (Client)
│   └── RoleSelector.tsx          # OFW / Consultant role choice cards
│
├── onboarding/                   # Onboarding step components
│   ├── ofw/
│   │   ├── OFWStep1Form.tsx      # Personal info form
│   │   ├── OFWStep2Form.tsx      # Deployment info form
│   │   ├── OFWStep3Form.tsx      # Interests + language
│   │   └── OFWStep4Upload.tsx    # Document upload for OFW
│   └── consultant/
│       ├── ConsultantStep1Form.tsx
│       ├── ConsultantStep2Form.tsx
│       ├── ConsultantStep3Form.tsx
│       └── ConsultantStep4Upload.tsx  # Documents + Stripe Connect button
│
├── consultants/                  # Consultant discovery components
│   ├── ConsultantCard.tsx        # Card shown in browse grid
│   ├── ConsultantGrid.tsx        # Responsive grid of ConsultantCards
│   ├── ConsultantFilters.tsx     # Category + mode + rating filter bar
│   ├── ConsultantProfile.tsx     # Full public profile layout
│   └── ReviewList.tsx            # List of public reviews on a profile
│
├── booking/                      # Booking flow components
│   ├── SessionBookingForm.tsx    # Session Mode booking form
│   ├── ProjectBookingForm.tsx    # Project Mode booking form
│   ├── MilestoneTemplateEditor.tsx  # 5-phase milestone % editor
│   └── BookingSummary.tsx        # Order summary before payment
│
├── engagements/                  # Engagement management components
│   ├── EngagementCard.tsx        # Card in the engagements list
│   ├── EngagementList.tsx        # List of engagements with status filters
│   ├── EngagementHeader.tsx      # Title, status badge, meet link in overview
│   ├── EscrowVaultCard.tsx       # Visual escrow status card
│   ├── MilestoneTracker.tsx      # Full 5-phase milestone UI (Project Mode)
│   ├── MilestonePhaseCard.tsx    # Individual phase card with tasks + submit
│   ├── TaskList.tsx              # Checklist of sub-tasks per milestone
│   ├── ProofSubmissionModal.tsx  # Modal to upload proof + note
│   ├── AIAuditResultCard.tsx     # Display Gemini verdict (approved/rejected/review)
│   ├── DisputeModal.tsx          # Raise dispute form
│   └── ReviewModal.tsx           # Post-completion review form
│
├── chat/                         # Chat components
│   ├── ChatWindow.tsx            # Full chat UI with message list + input (Client)
│   ├── MessageBubble.tsx         # Standard text/file message bubble
│   ├── MeetLinkCard.tsx          # Meet link system message card
│   ├── MilestoneUpdateCard.tsx   # Milestone progress system card
│   ├── SystemMessageCard.tsx     # Generic system event card
│   └── ChatInput.tsx             # Message input + file attach + send
│
├── vault/                        # Document vault components
│   ├── VaultFileList.tsx         # List of uploaded vault files
│   ├── VaultFileCard.tsx         # Individual file card with download
│   └── VaultUploadZone.tsx       # Upload area for vault files
│
├── wallet/                       # Wallet/payment components
│   ├── EscrowSummary.tsx         # Active escrow balances (OFW view)
│   ├── PaymentHistory.tsx        # Past transactions list
│   ├── ConsultantEarnings.tsx    # Earnings summary (Consultant view)
│   └── StripePaymentForm.tsx     # Stripe Elements payment form
│
├── admin/                        # Admin panel components
│   ├── UserTable.tsx             # Paginated user list table
│   ├── UserFilters.tsx           # Role + status filter bar
│   ├── UserDetailPanel.tsx       # User info + document links
│   ├── DocumentViewer.tsx        # Signed URL document link list
│   └── VerificationControls.tsx  # Verify / Reject / Under Review buttons
│
└── shared/                       # Cross-cutting shared components
    ├── NotificationBell.tsx      # Topbar notification icon + dropdown
    ├── EmptyState.tsx            # Empty list placeholder with CTA
    ├── PageHeader.tsx            # Page title + breadcrumb
    ├── LanguageToggle.tsx        # EN / FIL language switcher
    ├── StatusBadge.tsx           # Engagement / verification status badge
    └── WelcomeModal.tsx          # First-login welcome modal
```

---

## `/src/hooks` Directory

```
src/hooks/
├── useAuth.ts                    # Current user, role, verificationStatus from Zustand
├── useEngagementChat.ts          # Firestore real-time chat messages
├── useVault.ts                   # Firestore real-time vault files + upload function
├── useEngagement.ts              # Single engagement real-time listener
├── useEngagements.ts             # User's engagement list real-time listener
├── useNotifications.ts           # User's notification sub-collection listener
├── useConsultants.ts             # Firestore query for consultant browse/filter
├── useFileUpload.ts              # Firebase Storage upload with progress tracking
└── useStripe.ts                  # Stripe Elements setup and payment confirm
```

---

## `/src/lib` Directory

```
src/lib/
├── firebase/
│   ├── client.ts                 # Firebase client SDK initialization (singleton)
│   ├── admin.ts                  # Firebase Admin SDK (server-side only)
│   ├── auth.ts                   # Auth helper functions (getSessionUser, etc.)
│   └── storage.ts                # Storage helper functions (getSignedUrl, etc.)
├── stripe/
│   ├── client.ts                 # Stripe.js initialization (publishable key)
│   └── server.ts                 # Stripe server SDK (secret key, server-only)
├── gemini/
│   └── auditPrompt.ts            # buildAuditPrompt() function
├── google/
│   └── meet.ts                   # Google Calendar API Meet link generation
├── utils/
│   ├── cn.ts                     # clsx + tailwind-merge className utility
│   ├── formatCurrency.ts         # PHP peso formatting (₱1,234.00)
│   ├── formatDate.ts             # Date formatting with Manila timezone
│   ├── milestoneCalc.ts          # Milestone amount + percentage calculations
│   └── validators.ts             # Zod schemas for form validation
└── constants/
    ├── categories.ts             # CONSULTATION_CATEGORIES array with labels/descriptions
    ├── countries.ts              # OFW deployment countries list
    ├── documents.ts              # Required document definitions per role
    └── milestonePhases.ts        # MILESTONE_PHASES template array
```

---

## `/src/stores` Directory

```
src/stores/
├── authStore.ts                  # User profile, role, verificationStatus
├── engagementStore.ts            # Active engagement state cache
└── uiStore.ts                    # Modal open/close, sidebar state, language
```

---

## `/src/types` Directory

```
src/types/
├── user.ts                       # UserDocument, OFWProfile, ConsultantProfile
├── engagement.ts                 # EngagementDocument, Milestone, MilestoneTask
├── message.ts                    # MessageDocument, MessageType
├── review.ts                     # ReviewDocument, ReviewTag
├── vault.ts                      # VaultFileDocument
├── payment.ts                    # PaymentIntent metadata types
└── enums.ts                      # ConsultationCategory, VerificationStatus, EngagementStatus
```

---

## `/src/config` Directory

```
src/config/
├── stripe.ts                     # PLATFORM_FEE_PERCENT, currency config
├── gemini.ts                     # Model name, temperature, token limits
├── app.ts                        # BASE_URL, DISPUTE_TIMER_DAYS, file size limits
└── routes.ts                     # Route constants to avoid magic strings
```

---

## `/src/messages` Directory (i18n)

```
src/messages/
├── en.json                       # English strings (default)
└── fil.json                      # Filipino (Tagalog) strings
```

Key pages with Filipino translations (MVP):
- Landing page copy
- Role selection page
- OFW onboarding step labels + placeholders
- Verification pending page
- Dashboard welcome section

---

## `/functions/src` Directory (Firebase Cloud Functions)

```
functions/src/
├── index.ts                      # Function exports registry
├── config/
│   ├── firebase.ts               # Admin SDK initialization
│   └── env.ts                    # Environment variable access
├── handlers/
│   ├── onUserRoleSelected.ts     # Sets Firebase custom claims on role selection
│   ├── onVerificationApproved.ts # Sends verification email on status → 'verified'
│   ├── onVerificationRejected.ts # Sends rejection email with reason
│   ├── onBookingAccepted.ts      # Generates Meet link + sends notifications
│   ├── onEscrowFunded.ts         # Updates engagement status + notifies consultant
│   ├── onMilestoneSubmitted.ts   # Triggers Gemini AI audit
│   ├── onMilestoneApproved.ts    # Triggers Stripe Transfer + unlocks next phase
│   ├── onDisputeRaised.ts        # Locks funds + notifies admin
│   ├── onProjectCompleted.ts     # Final payout + unlocks review
│   ├── onReviewCreated.ts        # Updates consultant averageRating + totalReviews
│   └── disputeTimerJob.ts        # Scheduled: checks 5-day timer, auto-releases
├── lib/
│   ├── stripe.ts                 # Stripe server SDK
│   ├── gemini.ts                 # Gemini API caller
│   ├── meet.ts                   # Google Meet link generator
│   ├── notifications.ts          # Write to notifications sub-collection
│   └── email.ts                  # Email sending (Firebase Extensions or Nodemailer)
└── types/
    └── index.ts                  # Shared types for Cloud Functions
```

---

## Key File Contents

### `middleware.ts`
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  const publicPaths = ['/', '/login', '/register', '/verify-email'];
  if (publicPaths.some(p => pathname === p)) {
    if (sessionCookie) {
      // Redirect logged-in users away from auth pages
      try {
        const decoded = await verifySessionCookie(sessionCookie);
        if (decoded && pathname !== '/') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  // All other routes require a valid session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = await verifySessionCookie(sessionCookie);

    // Admin routes: require admin role
    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // App routes: require verified status
    if (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/consultants') ||
        pathname.startsWith('/engagements') ||
        pathname.startsWith('/book') ||
        pathname.startsWith('/wallet') ||
        pathname.startsWith('/profile')) {
      if (decoded.verificationStatus !== 'verified') {
        return NextResponse.redirect(new URL('/onboarding/pending', request.url));
      }
    }

    // OFW-only routes
    if ((pathname.startsWith('/consultants') || pathname.startsWith('/book')) &&
        decoded.role !== 'ofw') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

### `tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#1A3C5E',
          blue:    '#2563EB',
          gold:    '#F59E0B',
          cream:   '#FEF9F0',
          success: '#10B981',
          danger:  '#EF4444',
          muted:   '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### `src/types/enums.ts`
```ts
export type ConsultationCategory =
  | 'business'
  | 'work_local'
  | 'general'
  | 'benefits'
  | 'retirement'
  | 'reintegration'
  | 'education';

export type VerificationStatus =
  | 'pending_submission'
  | 'documents_submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export type EngagementStatus =
  | 'pending_acceptance'
  | 'accepted'
  | 'escrow_funded'
  | 'in_progress'
  | 'milestone_submitted'
  | 'dispute'
  | 'completed'
  | 'cancelled';

export type EscrowStatus =
  | 'unfunded'
  | 'funded'
  | 'partially_released'
  | 'fully_released'
  | 'refunded'
  | 'disputed';

export type UserRole = 'ofw' | 'consultant' | 'admin';

export type MessageType =
  | 'text'
  | 'file'
  | 'meet_link'
  | 'milestone_update'
  | 'system';

export type ReviewTag =
  | 'Thorough'
  | 'Responsive'
  | 'Knowledgeable'
  | 'Delivered on Time'
  | 'Clear Communication'
  | 'Went Above & Beyond'
  | 'Professional';
```

---

## File Naming Conventions

| Convention | Rule |
|---|---|
| Pages | `page.tsx` (Next.js App Router standard) |
| Layouts | `layout.tsx` |
| Components | PascalCase: `ConsultantCard.tsx` |
| Hooks | camelCase with `use` prefix: `useEngagementChat.ts` |
| Utilities | camelCase: `formatCurrency.ts` |
| Stores | camelCase with `Store` suffix: `authStore.ts` |
| Types | camelCase: `user.ts`, `engagement.ts` |
| API routes | `route.ts` (Next.js standard) |
| Constants | camelCase: `categories.ts` |

---

*← [10 — Admin Panel](./10-admin-panel.md) | Next: [12 — Page Content →](./12-page-content.md)*
