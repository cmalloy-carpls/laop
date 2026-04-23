# Legal Aid Operations Platform

> An open-source case management platform for civil legal aid — plug-and-play across operating models, sector-governed, AI-native, interoperable with Legal Server.

**Status:** Pre-alpha. Phase 0 — foundation.

## Thesis

Legal aid runs on tools that don't fit the work: Legal Server (old), Salesforce (a CRM bent into a pretzel), Clio (built for billing hours, not triaging strangers in crisis). This is a purpose-built platform whose core abstraction is the **Engagement** — one organization's involvement with one person's legal problem — composable into any service model a civil justice provider actually runs.

## Operating models

The platform activates as declarative **profiles**. Agencies turn on any combination:

- `hotline` — high-volume triage, telephony primary
- `field-office` — walk-in + appointment, docs-heavy
- `full-representation` — long-lived matters, calendaring, court integration
- `collaborative-network` — multi-org, federated conflict, partner portal
- `self-help` — public web intake, async messaging

## Guiding principles

1. Intake-first, not matter-first
2. Contract boundaries before implementations
3. Multi-tenant from line one
4. Legal Server interop, not replacement
5. No per-seat cost at the partner / pro-bono layer
6. AI-native (knowledge graph is part of the data model)
7. API-first, headless-first

## Repo layout

```
apps/            — application surfaces (web, docs)
packages/
  contracts/     — adapter interface contracts (source of truth)
  core/          — domain capabilities (person, matter, engagement, conflict, referral, …)
  adapters/      — reference adapter implementations (telephony, messaging, docgen, …)
  profiles/      — operating-model profiles
  ui/            — shared UI components
db/              — migrations + seed
docs/
  adr/           — architecture decision records
  capabilities/  — per-capability specs
  adapters/      — per-adapter contracts + implementation guides
  profiles/      — per-profile activation guides
```

## Architecture decisions

See [docs/adr/](./docs/adr/). Locked decisions:

- [0001 — Stack selection](./docs/adr/0001-stack-selection.md)
- [0002 — Tenancy model](./docs/adr/0002-tenancy-model.md)

## Development

Prerequisites: Node 20 LTS, pnpm 9, Postgres 16+.

```bash
pnpm install
pnpm dev
```

(No runnable code yet — this is Phase 0 scaffolding.)

## License

Apache 2.0 — see [LICENSE](./LICENSE).
