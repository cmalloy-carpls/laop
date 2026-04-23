# ADR 0002 — Tenancy model

**Status:** Accepted
**Date:** 2026-04-23

## Context

Every Organization using the platform must be isolated from every other Organization. Data leakage between tenants is existential for a platform handling attorney-client-privileged information. The tenancy model is woven into every query and every migration; getting it right at the start is orders of magnitude cheaper than changing it later.

Three standard models were evaluated.

## Decision

**Shared schema with Postgres row-level security (RLS), enforced at the database level.**

Mechanics:
- Every tenant-scoped table has `organization_id UUID NOT NULL REFERENCES organizations(id)`
- Each such table has an RLS policy: `USING (organization_id = current_setting('app.current_org')::uuid)`
- A request-scoped middleware sets `app.current_org` and `app.current_user` via `SET LOCAL` before any query executes
- Control-plane tables (e.g., `organizations` itself, platform-wide lookups) are explicitly marked cross-tenant and require a separate DB role (`platform_admin`)
- Drizzle migrations include RLS policy creation in the same migration file as table creation — a CI lint check (`db/check-rls.ts`) enforces this

Application code rule:
- `packages/core/db/tenant.ts` exports a single `withTenant(orgId, userId, fn)` helper — the only supported way to execute tenant-scoped queries
- Direct pool/client usage outside `withTenant` is banned by ESLint rule

Cross-tenant features (e.g., federated conflict checking) are explicit, audited exceptions — never implicit.

## Consequences

**Accepted trade-offs:**
- Single database — a DB-level failure affects all tenants. Offset by Neon HA + daily snapshots; upgrade path to per-tenant DBs documented below.
- Large tenants can dominate resource usage — offset by per-org rate limiting and query timeouts at the middleware layer.
- Migrations must be compatible with all tenants simultaneously — accepted; this is standard for shared-schema multi-tenant SaaS.

**Positive side-effects:**
- One migration pipeline, one backup, one monitoring setup — minimal ops during Phase 0-2
- Isolation is enforced by Postgres, not application code — a forgotten `WHERE organization_id = ?` cannot leak data
- pgvector, full-text search, and reporting aggregations work naturally within a single schema

## Upgrade path

An agency with regulatory or contractual isolation requirements (e.g., a state public defender's office) can be migrated to **schema-per-tenant** or **database-per-tenant** using the same application codebase:

- `withTenant` is the only isolation boundary the app code touches — changing the underlying session-variable injection to a schema `SET search_path` or a separate connection string is localized to one file
- This path is documented but not built until there is a concrete agency requiring it

## Alternatives considered

| Option | Why rejected |
|---|---|
| Schema-per-tenant | Strong isolation; but N-schema migrations and connection-pool complexity not worth it at Phase 0-2 scale |
| Database-per-tenant | Right answer for a handful of large enterprise tenants; wrong for rapid onboarding of small agencies |
| Application-level filtering only | Rejected outright — one missed `WHERE` clause is too dangerous for attorney-client data |
