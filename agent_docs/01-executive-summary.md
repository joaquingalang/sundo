# 01 — Executive Summary
### SUNDO: Project Context Document
**Version 1.0 — MVP | April 2026**

---

## What is Sundo?

**Sundo** *(Filipino: the act of fetching someone — going to meet them where they are and bringing them home safely)* is a digital freelance consultation platform purpose-built for Overseas Filipino Workers (OFWs) who have been displaced — or are at risk of displacement — due to the escalating Middle East conflict.

Sundo is not a job board. It is not a remittance app. It is **trust infrastructure** — a structured, escrow-backed, AI-validated platform that connects returning OFWs with verified OFW Consultants who can guide them through the most critical transition of their working lives.

---

## The Crisis

As of early 2026, the Philippine overseas employment ecosystem is under severe strain:

| Metric | Figure | Source |
|---|---|---|
| Land-based OFWs in the Middle East | 1.1 million+ | DMW, 2025 |
| Total Filipinos in the region | ~2.4 million | DFA, 2026 |
| OFWs stranded in Manila (post-ban) | 40,000+ | DMW, April 2026 |
| Workers repatriated (as of April 2026) | 4,000+ | DMW |
| Deployment ban countries | Saudi Arabia, UAE, Kuwait, Bahrain, Oman, Qatar, Israel, Lebanon | DMW |
| Annual remittances from Middle East (2025) | USD 6.48B (~PHP 380B) | BSP |
| Remittances as % of GDP (2025) | 7.3% — a 25-year low | BSP |

The Philippine government has activated the **New Pilipinas Bayanihan para sa Balikbayang Workers** initiative, providing job matching, livelihood grants, and psychosocial support. The DTI has launched a **PHP 2 billion OFW Negosyo Fund** for business startups. These are emergency measures.

**Sundo addresses what comes after the emergency.**

---

## The Gap

When an OFW returns home, government agencies provide immediate relief: food, shelter, PHP 50,000 in AKSYON funds, transportation. But structural, sustained guidance is absent. The returning OFW faces:

- **No trusted advisor** for domain-specific needs (business registration, benefits claims, local employment, retirement planning)
- **No accountability mechanism** when hiring informal consultants
- **No marketplace** for experienced returnees and professionals to formalize and monetize their guidance
- **High vulnerability** to scams — displaced workers are prime targets for fraudulent "consultants"
- **Financial exposure** — paying upfront with no recourse if work is not delivered

Meanwhile, there is a growing population of **experienced OFW returnees** who have navigated these systems themselves and are willing to guide others — but they have no professional platform to do so.

---

## The Solution

Sundo creates a **two-sided marketplace**:

| Side | Who they are | What they need |
|---|---|---|
| **OFW (Client)** | Returning or at-risk OFW | Verified, expert guidance for reintegration |
| **Consultant** | Experienced returnee or domain professional | A platform to offer structured, paid consultation services |

The platform delivers this through four core pillars:

### 1. Trust
Every user — OFW and Consultant alike — is verified through document submission reviewed by the Sundo admin team, with API integration points prepared for DMW/DFA verification systems. No unverified user can transact on the platform.

### 2. Safety
Money never changes hands directly. The **Sundo Escrow Vault** (powered by Stripe Connect Express) holds OFW funds until milestone deliverables are submitted, AI-validated, and approved. A dispute timer and admin escalation path protect both parties.

### 3. Matching
OFWs are matched with Consultants by **consultation category** (Business, Local Employment, General Consultation, Benefits, Retirement, Reintegration, Education) and by the OFW's declared situation status, ensuring urgency-appropriate routing.

### 4. Accountability
AI-powered proof-of-work validation (Google Gemini API) acts as an objective middleman — scanning uploaded documents against the declared deliverable before releasing escrow funds. Completed projects result in public reviews that build each Consultant's **Digital Credibility Score**.

---

## Engagement Models

Sundo supports two engagement types to cover the full spectrum of consultation needs:

| Mode | Best For | Payment | Structure |
|---|---|---|---|
| **Session Mode** | General Consultation, Benefits, Work (Local) | Per-session escrow | Single booking, release on completion |
| **Project Mode** | Business, Reintegration, Retirement, Education | 5-phase milestone escrow | Structured contract with AI-validated releases |

---

## Platform Economics

- **Platform Fee:** 5% charged to the OFW on every escrow transaction
- **Consultant Payout:** 95% of agreed fee, deposited to their Stripe Express account
- **Fee Rationale:** Sundo is a trust-heavy, niche platform with verified users, AI validation, and escrow management — not a commodity gig market. The 5% positions Sundo as OFW-affordable while sustaining platform operations. This is reviewed at Scale (post-MVP).

---

## What Sundo is Not

- ❌ Not a government portal — Sundo is a private platform that prepares integration points for government API systems (DMW, DFA)
- ❌ Not a recruitment agency — Sundo does not place OFWs in jobs
- ❌ Not a remittance platform — Sundo handles service payments, not family remittances
- ❌ Not a general freelance marketplace — every feature is built for the OFW reintegration context

---

## MVP Scope Statement

The MVP delivers:

1. Email/password authentication with role selection (OFW / Consultant)
2. Full onboarding flow for both roles
3. Document submission and manual admin verification (Firestore toggle)
4. Consultant discovery and profile browsing
5. Session Mode bookings with escrow
6. Project Mode engagements with 5-phase milestone contracts and AI validation
7. In-app messaging (post-booking) with programmatic Google Meet link generation
8. Document Vault per engagement (both parties can upload)
9. Admin panel: user list with verification toggle
10. Public Consultant profiles with reviews and ratings
11. Filipino language support on key pages
12. Role-based access control (OFW / Consultant / Admin)

---

*Next: [02 — User Roles & Personas →](./02-user-roles.md)*
