# 10 — Admin Panel
### SUNDO: Project Context Document

---

## Overview

The Sundo Admin Panel is an internal tool for the platform team to manage user verification. It is accessible only to users with `role === 'admin'` in their Firebase custom claims, under the `/admin` route group.

In the MVP, the admin panel is intentionally minimal — it does exactly what is needed to get users verified and onto the platform, without unnecessary complexity.

---

## Access Control

Admin accounts are created manually:

1. Create the user in Firebase Authentication console (email + password)
2. In Firestore, set `users/{uid}.role = 'admin'`
3. Use Firebase Admin SDK to set the custom claim: `{ role: 'admin' }`

Admin routes are protected by `middleware.ts`:
```ts
// middleware.ts
if (pathname.startsWith('/admin')) {
  if (!token || token.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

Admins are redirected away from all `(app)` routes — they only access `(admin)` routes. They do not have OFW or Consultant functionality.

---

## Admin Panel Routes (MVP)

```
/admin                    → Admin dashboard (user summary stats)
/admin/users              → Full user list with filters and verification controls
/admin/users/[uid]        → Individual user detail page
```

---

## Admin Dashboard (`/admin`)

A minimal landing page showing at-a-glance numbers:

```
┌────────────────────────────────────────────────────────┐
│ SUNDO Admin                              [Sign Out]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Pending Verification       Under Review    Verified   │
│       ┌──────┐               ┌──────┐      ┌──────┐   │
│       │  12  │               │   3  │      │  47  │   │
│       └──────┘               └──────┘      └──────┘   │
│                                                        │
│  [View All Users →]                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Stats are pulled from a Firestore aggregation query on the `users` collection, grouped by `verificationStatus`.

---

## User List (`/admin/users`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ All Users                                         [+ Add Admin] │
├─────────────────────────────────────────────────────────────────┤
│ [Search by name or email]  Filter: [All ▾] [OFW ▾] [Status ▾] │
├──────────────────────────┬───────────┬──────────────┬──────────┤
│ Name / Email             │ Role      │ Status       │ Actions  │
├──────────────────────────┼───────────┼──────────────┼──────────┤
│ Maria Santos             │ OFW       │ 🟡 Submitted │ [Review] │
│ maria@email.com          │           │ Apr 19, 2026 │          │
├──────────────────────────┼───────────┼──────────────┼──────────┤
│ Carlo Reyes              │ Consultant│ ✅ Verified  │ [View]   │
│ carlo@email.com          │           │ Apr 10, 2026 │          │
├──────────────────────────┼───────────┼──────────────┼──────────┤
│ Ana Cruz                 │ OFW       │ 🔴 Rejected  │ [View]   │
│ ana@email.com            │           │ Apr 17, 2026 │          │
├──────────────────────────┼───────────┼──────────────┼──────────┤
│ Jun Dela Cruz            │ Consultant│ 🟠 Reviewing │ [Review] │
│ jun@email.com            │           │ Apr 20, 2026 │          │
└──────────────────────────┴───────────┴──────────────┴──────────┘
[← Prev]  Page 1 of 4  [Next →]
```

### Status Badge Colours

| Status | Badge |
|---|---|
| `pending_submission` | ⚪ Grey — Not submitted yet |
| `documents_submitted` | 🟡 Yellow — Awaiting review |
| `under_review` | 🟠 Orange — Admin is actively reviewing |
| `verified` | ✅ Green |
| `rejected` | 🔴 Red |

### Filters

| Filter | Options |
|---|---|
| Role | All / OFW / Consultant |
| Status | All / Pending / Submitted / Under Review / Verified / Rejected |
| Date range | Submitted after [date] |

---

## Individual User Detail (`/admin/users/[uid]`)

This is the primary verification workspace. The admin sees all submitted information and documents, then makes a verification decision.

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Users                                                │
│                                                                │
│ [Profile Photo]  Maria Santos                                  │
│                  OFW  ·  documents_submitted  ·  Apr 19, 2026  │
├────────────────────────────────────────────────────────────────┤
│ PROFILE INFORMATION                                            │
│ Full Name:            Maria Rose Santos                        │
│ Email:                maria@email.com                          │
│ Philippine Address:   Barangay San Jose, Pampanga              │
│ Country of Deployment: Saudi Arabia                            │
│ Employer Abroad:      Al-Muhanad Cleaning Co.                  │
│ Job Title:            Domestic Helper                          │
│ Situation Status:     Recently Repatriated                     │
│ Primary Interests:    Benefits, Reintegration                  │
│ Salary Range:         PHP 20,000 – PHP 40,000/month           │
├────────────────────────────────────────────────────────────────┤
│ SUBMITTED DOCUMENTS                                            │
│                                                                │
│ 🪪 Government-Issued ID    [View Document ↗]                  │
│ 📘 Passport               [View Document ↗]                  │
│ 🗂️  OFW Card / OEC        [View Document ↗]                  │
│ 🛂 Working VISA           [View Document ↗]                  │
│ 🏠 Proof of Address       [View Document ↗]                  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ VERIFICATION DECISION                                          │
│                                                                │
│ Current Status: 🟡 Documents Submitted                        │
│                                                                │
│ [Mark as Under Review]                                         │
│                                                                │
│ ─────────────────────────────────────────────────────────     │
│                                                                │
│ [✅ Verify User]                                              │
│                                                                │
│ [❌ Reject]                                                   │
│ Rejection Reason: [________________________________]           │
│ (Required — shown to user in their rejection notification)     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Document Viewer
"View Document ↗" links open the Firebase Storage download URL in a new tab. Documents are fetched with a short-lived signed URL generated server-side so the raw Storage path is never exposed.

### Verification Actions

| Button | Firestore Change | Side Effect |
|---|---|---|
| Mark as Under Review | `verificationStatus → 'under_review'` | No user-facing notification |
| Verify User | `verificationStatus → 'verified'` | Cloud Function sends "You're verified!" email; user auto-redirected on next app visit |
| Reject | `verificationStatus → 'rejected'`, `rejectionReason → [text]` | Cloud Function sends rejection email with reason; user sees reason + resubmit option |

---

## Firestore Security Rules — Admin Scope

```
// Admin can read all users and update verificationStatus
match /users/{uid} {
  allow read: if isAdmin();
  allow update: if isAdmin() && 
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['verificationStatus', 'rejectionReason', 'updatedAt']);
}

// Admin can read all engagements (for dispute resolution — post-MVP)
match /engagements/{engagementId} {
  allow read: if isAdmin();
}

function isAdmin() {
  return request.auth != null && request.auth.token.role == 'admin';
}
```

---

## Post-MVP Admin Expansions

The following are not in MVP but the data structures and routes are scaffolded for them:

| Feature | Route | Description |
|---|---|---|
| Dispute resolution | `/admin/disputes` | View flagged engagements, see evidence from both parties, issue refund or release |
| Platform analytics | `/admin/analytics` | Engagement volume, revenue, category breakdown |
| Manual AI review | `/admin/milestones` | Review milestones flagged as `manual_review` by Gemini |
| Broadcast messaging | `/admin/broadcast` | Send platform-wide announcements to OFWs or Consultants |

---

*← [09 — Communication System](./09-communication-system.md) | Next: [11 — Next.js File Structure →](./11-nextjs-file-structure.md)*
