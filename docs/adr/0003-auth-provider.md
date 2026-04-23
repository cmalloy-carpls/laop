# ADR 0003 — Auth provider

**Status:** Accepted
**Date:** 2026-04-23
**Supersedes:** n/a (deferred slot from ADR-0001)

## Context

ADR-0001 deferred auth to here. The criteria, in order:

1. **Next.js 15 App Router native** — server components, middleware, and server actions must all get the session without ceremony
2. **Multi-tenant safe** — session must carry `organizationId` so every API handler can call `withTenant()` without a DB lookup
3. **Ops minimalism** — managed during Phase 0–2; self-host path required for open-source adoption
4. **SSO / SAML path** — partner agencies (legal aid orgs) will want Okta/Entra federation; the provider must support it without a forklift

## Decision

**Clerk.**

| Criteria | Clerk | Auth.js | Supabase Auth |
|---|---|---|---|
| App Router native | ✅ First-class middleware + `currentUser()` RSC helper | ⚠️ Adapter-based; session cookies need wrapping | ⚠️ Client SDK primary; SSR path is manual |
| Multi-tenant org support | ✅ Clerk Organizations built-in; `orgId` on every JWT | ❌ DIY | ❌ DIY |
| Self-host path | ✅ Clerk Elements + Clerk Backend API | ✅ Fully self-hostable | ✅ Fully self-hostable |
| SSO / SAML | ✅ Built-in, per-org | ⚠️ Plugin ecosystem | ⚠️ Enterprise tier only |
| Free tier | ✅ 10k MAU | ✅ Unlimited (self-hosted) | ✅ 50k MAU |

Auth.js is the right answer if we were certain we'd self-host from day one. We're not — Phase 0–2 is managed. Clerk's Organizations feature maps directly to our `Organization` entity and puts `orgId` in the JWT with zero extra work, which is the critical multi-tenant invariant for `withTenant()`.

Self-host migration path: Clerk publishes a self-hosted option (Clerk Elements + your own backend). If licensing becomes an issue at scale, ADR supersession is straightforward — swap `@clerk/nextjs` for `better-auth` or Auth.js and update `src/lib/auth.ts`. The session interface is our abstraction boundary; nothing else in the codebase imports Clerk directly.

## Implementation

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in `.env.local`
- `clerkMiddleware()` in `apps/web/src/middleware.ts` — protects `/(app)/*` routes
- `src/lib/auth.ts` — thin wrapper over `currentUser()` / `auth()` returning our `Session` type; **only file that imports from `@clerk/nextjs`**
- Clerk `organizationId` maps to `Organization.id` — agencies must create an Organization in Clerk that matches their DB record; seeded at org setup time

## Consequences

- Every route inside `/(app)/` is protected by middleware before the server component runs
- `withTenant(session.organizationId, session.userId, ...)` is the first call in every API route handler and server action
- Pro-bono and partner users get Clerk invitations with restricted roles — no per-seat cost implications until Clerk's org member pricing kicks in (currently generous)

## Supersession triggers

- Clerk pricing changes unfavorably at our scale → migrate to `better-auth` (self-hosted)
- A partner agency requires an on-premises auth deployment → self-host Clerk Elements or swap to Auth.js
