# Sundo

A trusted consultation platform for returning Overseas Filipino Workers.

## Overview

Sundo is a two-sided marketplace connecting returning OFWs with verified OFW Consultants. It was built in response to the displacement of 40,000+ OFWs stranded in Manila following the Middle East conflict — a population that lacks access to trusted advisors and is vulnerable to financial scams.

The platform is built on four pillars:

- **Trust** — verified identity and credential checks for all users
- **Safety** — escrow vault holds payments until work is confirmed
- **Matching** — consultants discoverable by specialization category
- **Accountability** — AI-validated proof-of-work and post-session reviews

OFWs can engage consultants in two modes: **Session Mode** (single paid session) or **Project Mode** (five-phase milestone-based engagement). The platform charges a 5% fee to OFWs and remits 95% to consultants.

## Features

- Role-based access: OFW (client) and Consultant roles with document-verified onboarding
- Consultant discovery by category (Business, Benefits, Reintegration, Education, and more)
- Escrow payment vault with milestone-based release
- AI proof-of-work validation using Google Gemini
- Real-time in-app chat and Google Meet video sessions
- Document vault for secure file sharing within engagements
- Admin panel for user verification and dispute oversight
- Bilingual interface (Filipino and English)

## Getting Started

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (validates TypeScript)
npm run lint     # ESLint
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Auth | [Firebase Authentication](https://firebase.google.com/products/auth) |
| Database | [Firestore](https://firebase.google.com/products/firestore) |
| Storage | [Firebase Storage](https://firebase.google.com/products/storage) |
| Backend functions | [Firebase Cloud Functions](https://firebase.google.com/products/functions) |
| Payments | [Stripe Connect Express](https://stripe.com/connect) |
| AI | [Google Gemini API](https://ai.google.dev) (gemini-1.5-flash) |
| Video | [Google Meet API](https://developers.google.com/meet) |
| State management | [Zustand 5](https://zustand-demo.pmnd.rs) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| i18n | [next-intl 3](https://next-intl-docs.vercel.app) |
| Hosting | [Vercel](https://vercel.com) |
