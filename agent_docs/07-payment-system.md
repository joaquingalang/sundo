# 07 — Payment System
### SUNDO: Project Context Document

---

## Overview

Sundo's payment system is built on **Stripe Connect Express**. The platform acts as the financial intermediary — holding funds in escrow and releasing them only when conditions are met (session completion or AI-validated milestone approval).

The architecture follows Stripe's **Destination Charges** model, where:
- The OFW pays Sundo's Stripe account
- Sundo holds funds and triggers `Transfer` objects to consultant accounts at defined release points
- The platform fee is deducted automatically via `application_fee_amount`

---

## Platform Fee

| Parameter | Value |
|---|---|
| Fee rate | 5% |
| Charged to | OFW (added on top of consultant's agreed rate) |
| Deducted from | Each Stripe PaymentIntent via `application_fee_amount` |
| Config constant | `PLATFORM_FEE_PERCENT = 0.05` in `src/config/stripe.ts` |

**Fee rationale:**
- Upwork charges 10–20% (freelancer-side); Fiverr charges 20%
- Clarity.fm (consultation-specific) charges 15%
- Sundo's 5% is intentionally OFW-accessible — the platform's value is trust and structure, not margin extraction
- At scale, 5% sustains operations when transaction volume is sufficient; fee is reviewed at 500 active engagements/month

**Fee example (Session Mode):**
```
Consultant rate:    ₱1,000/hour
Session duration:   60 minutes
Subtotal:           ₱1,000
Platform fee (5%):  ₱50
Total OFW pays:     ₱1,050
Consultant receives: ₱1,000
```

**Fee example (Project Mode — per milestone):**
```
Agreed project total:       ₱20,000
Platform fee (5%):          ₱1,000
Total OFW funds in escrow:  ₱21,000

Phase 1 release (20%):
  Consultant receives:      ₱4,000
  Fee already collected:    Proportional (held by Sundo from initial charge)
```

> The platform fee is collected once at the time of the initial `PaymentIntent` capture, not per milestone. This simplifies the Stripe implementation — one charge, multiple transfers over time.

---

## Stripe Connect Express — Consultant Onboarding

### Flow

1. During Consultant onboarding Step 4, a "Set Up Payouts" button calls:
   ```ts
   // API Route: POST /api/stripe/connect/create-account
   const account = await stripe.accounts.create({ type: 'express', country: 'PH' });
   // Store account.id in users/{uid}.consultant.stripeAccountId
   
   const accountLink = await stripe.accountLinks.create({
     account: account.id,
     refresh_url: `${BASE_URL}/onboarding/consultant/step-4?stripe=refresh`,
     return_url: `${BASE_URL}/onboarding/consultant/step-4?stripe=success`,
     type: 'account_onboarding',
   });
   // Redirect consultant to accountLink.url
   ```
2. Consultant completes Stripe's hosted KYC (identity verification, bank account, etc.)
3. Stripe redirects back to Sundo with `?stripe=success`
4. Sundo marks `stripeOnboardingComplete: true` in Firestore
5. Consultant cannot receive payouts until `stripeOnboardingComplete === true`

> Stripe Connect Express is available in the Philippines. Consultants receive payouts in PHP to their local bank accounts or GCash (subject to Stripe's PH payout options).

---

## Escrow Vault — Technical Implementation

### Concept
The "Sundo Escrow Vault" is a UX abstraction. Technically, it is a captured `PaymentIntent` sitting in Sundo's Stripe balance, not yet transferred to the consultant. The UI presents this as "funds locked in vault" with a visual balance indicator.

### PaymentIntent Creation (Booking → Escrow Funding)

```ts
// API Route: POST /api/stripe/payment/create-intent
// Called when OFW confirms booking and proceeds to pay

const subtotal = agreedAmount; // in PHP centavos (₱1,000 = 100000)
const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);
const total = subtotal + platformFee;

const paymentIntent = await stripe.paymentIntents.create({
  amount: total,                         // Total charged to OFW
  currency: 'php',
  application_fee_amount: platformFee,  // Retained by Sundo
  transfer_data: {
    destination: consultantStripeAccountId,
  },
  metadata: {
    engagementId,
    ofwId,
    consultantId,
    mode: 'session' | 'project',
  },
  capture_method: 'automatic',          // Funds captured immediately on confirm
});

// Store paymentIntent.id in engagement document
// Engagement status → 'escrow_funded'
```

### Milestone/Session Release (Transfer)

```ts
// Cloud Function: triggered by milestone approval or session completion

const transfer = await stripe.transfers.create({
  amount: milestoneAmount,              // In PHP centavos; no fee deducted (already taken)
  currency: 'php',
  destination: consultantStripeAccountId,
  transfer_group: engagementId,         // Groups all transfers for this engagement
  metadata: {
    engagementId,
    milestoneIndex,
    consultantId,
  },
});

// Update milestone.status → 'paid'
// Update milestone.paidAt → now
// If all milestones paid → update engagement.escrowStatus → 'fully_released'
```

### Refund (Dispute Resolution — Ruling for OFW)

```ts
// Cloud Function: triggered by admin dispute resolution

const refund = await stripe.refunds.create({
  payment_intent: stripePaymentIntentId,
  amount: refundAmount,                 // Partial or full; admin-specified
  reason: 'fraudulent' | 'requested_by_customer',
});
```

---

## Stripe Webhook Handling

Webhooks are handled in `app/api/stripe/webhook/route.ts`. All webhook handlers verify the Stripe signature before processing.

| Event | Handler Action |
|---|---|
| `payment_intent.succeeded` | Update `escrowStatus → 'funded'`; trigger Meet link generation |
| `payment_intent.payment_failed` | Notify OFW; revert engagement to `accepted` state |
| `transfer.created` | Log transfer in engagement; update milestone status |
| `account.updated` | Update `stripeOnboardingComplete` if account becomes fully enabled |
| `charge.dispute.created` | Flag engagement as `dispute`; notify admin |

---

## Wallet Page (`/wallet`)

### For OFWs
Displays payment history and current escrow status for all engagements.

```
Active Escrow
─────────────────────────────────────
Project: Help me register my sari-sari store
Consultant: Carlo Reyes
Total in Vault: ₱21,000
Released so far: ₱4,200 (Phase 1)
Remaining: ₱16,800

[View Engagement]
─────────────────────────────────────

Payment History
Date            Description                   Amount
Apr 15, 2026    Session — Career Guidance     ₱1,050  ✅
Apr 2, 2026     Project — Business Setup      ₱21,000 🔒 In Escrow
```

### For Consultants
Displays Stripe Express dashboard link + upcoming earnings.

```
[Open Stripe Payout Dashboard ↗]

Pending Earnings
─────────────────────────────────────
Project: Business Registration — Maria S.
Phase 2 submitted — Awaiting AI Review
Expected: ₱5,000

Paid Out This Month
─────────────────────────────────────
Phase 1 — Business Registration   ₱4,000   Apr 18
Session — Career Consultation     ₱800     Apr 10
                            Total: ₱4,800
```

---

## Security Considerations

- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are **never exposed to the client**. All Stripe server-side calls happen in Next.js API routes or Cloud Functions.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the only Stripe key on the client, used only to initialize `@stripe/stripe-js` for the payment form.
- Stripe webhook endpoint verifies signature using `stripe.webhooks.constructEvent()` before any processing.
- Transfer amounts are always calculated server-side and cross-referenced against the Firestore engagement document — the client cannot specify a transfer amount directly.
- All Stripe `metadata` fields are cross-validated in Cloud Functions against Firestore before any fund movement.

---

*← [06 — Engagement System](./06-engagement-system.md) | Next: [08 — AI Integration →](./08-ai-integration.md)*
