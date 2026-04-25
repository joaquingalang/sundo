# 02 — User Roles & Personas
### SUNDO: Project Context Document

---

## Overview

Sundo has three user roles. Every role is enforced at the Firestore document level and reflected in route-level middleware on the Next.js App Router.

| Role | Description | Can Book | Can Consult | Can Verify Users |
|---|---|---|---|---|
| `ofw` | Returning or at-risk OFW seeking consultation | ✅ | ❌ | ❌ |
| `consultant` | Experienced returnee or domain professional offering services | ❌ | ✅ | ❌ |
| `admin` | Sundo platform administrator | ❌ | ❌ | ✅ |

---

## Role A: OFW (Client)

### Persona
A Filipino worker who was employed abroad — primarily in the Middle East — and is either currently returning, recently repatriated, or has been home for several months without a stable livelihood plan. They are navigating an unfamiliar system (local business registration, SSS/GSIS/PhilHealth claims, TESDA programs, etc.) and need structured, trustworthy guidance.

### Situation Status (declared at onboarding)
This field drives urgency-based consultant matching. OFWs in earlier stages are surfaced more Benefits/Reintegration consultants; later stages surface more Business/Work consultants.

| Status | Label | Routing Priority |
|---|---|---|
| `abroad` | Currently abroad, planning to return | General + Benefits |
| `recently_repatriated` | Repatriated within the last 30 days | Benefits + Reintegration |
| `home_1_6mo` | Have been home 1–6 months | Reintegration + Business |
| `home_6mo_plus` | Have been home 6+ months | Business + Work (Local) |

---

### Onboarding Fields (OFW)

Collected across a multi-step onboarding flow after role selection. All fields are stored in the `users/{uid}` Firestore document.

| Field | Type | Notes |
|---|---|---|
| `fullName` | Text | Must match government ID submitted in document step |
| `jobTitle` | Text | Last held position abroad (e.g., "Construction Foreman") |
| `countryOfDeployment` | Dropdown | Searchable list of countries; pre-filtered to Middle East region |
| `employerAbroad` | Text | Name of last employer/agency abroad |
| `philippineAddress` | Text (structured) | Barangay, City/Municipality, Province |
| `situationStatus` | Dropdown | See Situation Status table above |
| `salaryRange` | Dropdown | See ranges below |
| `monthlyRemittanceRange` | Dropdown | See ranges below |
| `primaryInterest` | Multi-select (up to 2) | Consultation categories — see below |
| `languagePreference` | Toggle | English / Filipino (Tagalog) |

**Salary Range Options:**
- Below PHP 20,000/month
- PHP 20,000 – PHP 40,000/month
- PHP 40,000 – PHP 80,000/month
- PHP 80,000 – PHP 150,000/month
- PHP 150,000+/month
- Prefer not to say

**Monthly Remittance Range Options:**
- Below PHP 10,000/month
- PHP 10,000 – PHP 25,000/month
- PHP 25,000 – PHP 50,000/month
- PHP 50,000 – PHP 100,000/month
- PHP 100,000+/month
- Prefer not to say

---

## Role B: Consultant

### Persona
An experienced OFW returnee or Filipino professional with domain knowledge in one or more reintegration areas. They have navigated the systems OFWs face — or they work professionally in those domains (e.g., a licensed financial advisor, a TESDA-accredited trainer, a DTI-registered business coach). They want to formalize their knowledge into a paid service with a structured platform backing their credibility.

### Onboarding Fields (Consultant)

| Field | Type | Notes |
|---|---|---|
| `fullName` | Text | Must match government ID |
| `jobTitle` | Text | How they present professionally (e.g., "Business Reintegration Specialist") |
| `philippineAddress` | Text (structured) | Barangay, City/Municipality, Province |
| `expertise` | Multi-select | Consultation categories — drives matching with OFWs |
| `sessionRate` | Number (PHP) | Hourly rate for Session Mode bookings |
| `projectRateRange` | Text | Indicative range for Project Mode (e.g., "PHP 5,000 – PHP 20,000") |
| `bio` | Long text | 500 character max — shown on public profile |
| `yearsOfExperience` | Number | Used in profile display |
| `languagesSpoken` | Multi-select | English, Filipino, and regional languages |
| `engagementModes` | Checkbox | Can offer Session Mode, Project Mode, or both |
| `languagePreference` | Toggle | Platform UI language preference |

---

## Consultation Categories

These categories are the core matching layer between OFWs and Consultants. Both roles select from this same set.

| Category | Description | Typical Engagement Mode |
|---|---|---|
| **Business** | Starting or registering a business in the Philippines (DTI, SEC, BIR, permits) | Project Mode |
| **Work (Local)** | Finding and transitioning to local employment; resume writing; job market navigation | Session Mode |
| **General Consultation** | Open-ended guidance; first steps; not yet sure what they need | Session Mode |
| **Benefits** | SSS, GSIS, PhilHealth, Pag-IBIG, OWWA claims and entitlements | Session Mode |
| **Retirement** | Retirement planning, pension optimization, lifestyle transition | Session or Project |
| **Reintegration** | Holistic reintegration roadmapping; emotional, financial, and social transition | Project Mode |
| **Education** | Scholarships for dependents, TESDA upskilling, professional certifications | Session or Project |

---

## Document Requirements

After onboarding, both roles must submit identity and credential documents before they can use the platform. Document submission triggers a verification review by the Sundo admin team. The platform is architected to support DMW/DFA API-based verification when those integrations are available.

### Document Submission Matrix

| Document | OFW | Consultant | Notes |
|---|---|---|---|
| **Government-Issued ID** | ✅ Required | ✅ Required | PhilSys, Driver's License, Passport data page, Voter's ID, etc. |
| **Passport** | ✅ Required | ✅ Optional | Required for OFWs to verify international employment history |
| **OFW Card / OEC** | ✅ Required | ❌ | Overseas Employment Certificate — proves OFW status |
| **Working VISA** | ✅ Required | ❌ | Copy of last employment visa from host country |
| **Profile Photo** | ✅ Required | ✅ Required | Clear, recent photo — shown on profile |
| **Proof of Philippine Address** | ✅ Required | ✅ Required | Barangay certificate, utility bill, or similar |
| **BIR / TIN Document** | ❌ Optional | ✅ Required | Required for consultants receiving taxable income |
| **Professional Credentials** | ❌ | ✅ Required | Certificates, licenses, diplomas, or any proof of expertise |
| **Proof of Area of Operation** | ❌ | ✅ Optional | For consultants offering on-ground services (e.g., business permit fixers) |

### Verification States

Documents go through the following states stored in `users/{uid}.verificationStatus`:

```
pending_submission → documents_submitted → under_review → verified | rejected
```

| State | User Experience |
|---|---|
| `pending_submission` | Onboarding document upload screen |
| `documents_submitted` | "We've received your documents. Hang tight." holding screen |
| `under_review` | Same holding screen with estimated timeline |
| `verified` | Full platform access unlocked |
| `rejected` | Rejection reason shown; option to resubmit |

> **MVP Implementation:** An admin toggles `verificationStatus` to `verified` directly in Firestore via the Admin Panel. The platform is architected so that a DMW/DFA API call can replace this toggle when those integrations go live.

---

## Role: Admin

Admins are internal Sundo team members. Admin accounts are created manually in Firebase Authentication and assigned the `admin` role in Firestore.

### Admin Capabilities (MVP)

| Capability | Description |
|---|---|
| View all users | Paginated list of OFW and Consultant accounts with status |
| View submitted documents | Access to Firebase Storage links for each user's documents |
| Toggle verification status | Change `verificationStatus` between states |
| View rejection log | History of rejected verifications with reasons |

> Admin routes are under `/admin` and are protected by middleware checking `role === 'admin'` in the decoded Firebase JWT.

---

## User State Machine

Every user passes through this lifecycle from registration to active use:

```
Registration (email + password)
    ↓
Email Verification (Firebase Auth)
    ↓
Role Selection (OFW or Consultant)
    ↓
Onboarding Form (role-specific fields)
    ↓
Document Submission
    ↓
Awaiting Verification (holding screen)
    ↓
Verified → Full App Access
```

> Users who are not yet verified can log in but will always be redirected to the verification holding screen. They cannot browse consultants, create bookings, or receive bookings.

---

*← [01 — Executive Summary](./01-executive-summary.md) | Next: [03 — Tech Stack →](./03-tech-stack.md)*
