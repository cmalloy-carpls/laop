# ADR 0001 — Stack selection

**Status:** Accepted
**Date:** 2026-04-23

## Context

The master plan is deliberately stack-agnostic so it can be challenged at the architecture level without being tangled in implementation choices. Code is not stack-agnostic. Step 1 requires concrete choices. This ADR locks them with explicit reasoning so they can be superseded cleanly if they turn out wrong.

Optimization criteria, in order:
1. **AI-assisted velocity** — LLM training-data density in the ecosystem is a real productivity factor
2. **Ops minimization during Phase 0-2** — zero-ops managed services until there's traction to justify complexity
3. **Boring and portable** — nothing exotic the next contributor has to learn before they're useful
4. **Self-hostable** — every managed-service choice must have an open-source self-host path

## Decision

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Incremental caching, clean package boundaries |
| Language | TypeScript (strict) | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Node | 20 LTS | Pinned via `.nvmrc` |
| App framework | Next.js 15 (App Router) | Largest LLM training-data surface; RSC + server actions |
| Typed internal APIs | tRPC v11 | Cross-package type safety; internal only — not the public API |
| UI | Tailwind CSS + shadcn/ui | Composable, no design-system lock-in |
| Database | PostgreSQL 16+ | Row-level security, pgvector for embeddings |
| ORM | Drizzle | SQL-forward, inspectable migrations, clean RLS interop |
| Background jobs | Inngest | Durable, observable; replaces scheduled Apex |
| Email | Resend (reference adapter) | Swappable via `EmailAdapter` contract |
| File storage | Cloudflare R2 (reference adapter) | Swappable via `StorageAdapter` contract |
| AI | Anthropic Claude (reference adapter) | Swappable via `AIModelAdapter` contract |
| Auth | Deferred — see ADR 0003 | Clerk vs. Supabase Auth vs. Auth.js |
| Phase 0-2 hosting | Vercel (app) + Neon (Postgres) | Zero-ops; self-host path on any Node host documented at Phase 3 |

## Consequences

**Accepted trade-offs:**
- Vercel lock-in during prove-it phase — offset by Apache 2.0 and a documented Fly.io / self-host migration path
- Next.js App Router is still evolving — we accept the churn as the cost of RSC-native data patterns
- tRPC couples internal packages to a specific wire shape — accepted because tRPC stays strictly internal; tenant-boundary APIs are REST + webhooks

**Positive side-effects:**
- TypeScript strict mode means contract violations surface at compile time across packages, not at runtime in production
- Drizzle over Prisma gives us hand-editable migrations — critical for RLS policies that must coexist with every table creation
- Turborepo incremental caching keeps CI flat as the monorepo grows past 20 packages

## Alternatives considered

| Option | Why rejected |
|---|---|
| SvelteKit | Smaller LLM training-data surface; real velocity cost |
| Remix | Competitive but smaller community; no meaningful advantage |
| Django + HTMX | Two languages splits the team; rejected for contract discipline |
| Prisma over Drizzle | Opaque query generation; weaker native RLS interop |
| Hono + separate React SPA | Cleaner separation but doubles deployment surface for Phase 0-2 |

## Supersession triggers

- Drizzle blocks a required RLS pattern → raw SQL migrations + thin wrapper
- Vercel pricing becomes infeasible → Fly.io or self-hosted Node
- Next.js App Router introduces a breaking pattern → freeze on last known-good version
