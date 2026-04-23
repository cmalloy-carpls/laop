# LAOP — Legal Aid Operations Platform

## Repo layout

```
apps/web/          Next.js 15 App Router (primary UI)
packages/db/       Drizzle ORM + Neon schema, migrations, types
packages/contracts/ Branded ID types, shared Zod schemas
db/migrations/     Drizzle-kit generated SQL migrations
db/seed/           Seed scripts (LSC problem codes, etc.)
```

## Key commands

```bash
# Dev server (from apps/web/)
node_modules/.bin/next.cmd dev --port 4000

# Database migrations
cd packages/db && pnpm drizzle-kit migrate

# Seed problems
node db/seed/seed.mjs

# Type check
cd apps/web && node_modules/.bin/tsc.cmd --noEmit
```

## Tech stack

- **Framework**: Next.js 15 (App Router, React 19)
- **API**: tRPC v11 (server + client)
- **DB**: Neon (Postgres) + Drizzle ORM
- **Auth**: Clerk (organizations enabled; roles: org:admin, org:supervisor, org:staff)
- **Styles**: Tailwind CSS v3 (brand-* palette in tailwind.config.ts)
- **Package manager**: pnpm workspaces

## Architecture notes

- Multi-tenant: every DB query goes through `withTenant(orgId, userId, fn)` which sets RLS context
- tRPC server-side calls use `callTRPCProcedure` (not the HTTP route)
- Route groups: `(app)/` has the shell layout (Sidebar + Header); public routes are outside it
- Clerk middleware: denylist pattern — protects everything except `/sign-in`, `/sign-up`, `/api/webhooks`
- OrganizationId is a plain string (pnpm workspace brand symbol incompatibility was resolved this way)

## Windows dev notes

- Use `node_modules\.bin\next.cmd` (not the bash shebang `next`) in PowerShell/cmd
- Port 4000 (3000 often occupied by other processes)
- Clerk's dev-browser check means curl/PowerShell requests to protected routes get a 404-looking response — use a real browser

## Current phase: Phase 1 complete, Phase 2 starting

Completed: Person registry, Matter + Engagement CRUD, Problem taxonomy, intake wizard (3-step), engagement detail page, people list, engagements list.

Next: Eligibility screening, intake workflow improvements (hotline profile), telephony adapter.
