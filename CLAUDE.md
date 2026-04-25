## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (also validates TypeScript)
npm run lint     # ESLint
```

No test runner is configured. Use `npm run build` to catch TypeScript errors.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Firestore |
| Storage | Firebase Storage |
| Hosting | Vercel |
| Data fetching | TanStack Query v5 |
| AI | Google Gemini (`@google/generative-ai`) |

---

## Agent Docs Reference

Load these docs based on the task at hand — don't read all of them.

| Task | Primary | Also read |
|---|---|---|
| Understanding the product or user needs | `agent_docs/01-executive-summary.md` | `agent_docs/02-user-roles.md` |
| User roles, verification states, permissions | `agent_docs/02-user-roles.md` | `agent_docs/05-auth-and-onboarding.md` |
| Tech stack config, env vars, packages | `agent_docs/03-tech-stack.md` | — |
| Firestore schema, security rules, data model | `agent_docs/04-app-architecture.md` | `agent_docs/02-user-roles.md` |
| Auth, email verification, onboarding flow | `agent_docs/05-auth-and-onboarding.md` | `agent_docs/04-app-architecture.md` |
| Engagement flows, sessions, projects, disputes | `agent_docs/06-engagement-system.md` | `agent_docs/09-communication-system.md` |
| Payments, escrow, Stripe, milestone release | `agent_docs/07-payment-system.md` | `agent_docs/06-engagement-system.md` |
| AI milestone validation (Gemini) | `agent_docs/08-ai-integration.md` | `agent_docs/06-engagement-system.md` |
| Chat, Google Meet, document vault | `agent_docs/09-communication-system.md` | `agent_docs/06-engagement-system.md` |
| Admin panel | `agent_docs/10-admin-panel.md` | `agent_docs/04-app-architecture.md` |
| File structure, adding new routes or files | `agent_docs/11-nextjs-file-structure.md` | `agent_docs/04-app-architecture.md` |
| Building or locating UI pages/components | `agent_docs/12-page-content.md` | `agent_docs/11-nextjs-file-structure.md` |

---
