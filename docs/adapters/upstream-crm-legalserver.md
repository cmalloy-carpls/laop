# Legal Server — UpstreamCRM Adapter Implementation Guide

> Reference implementation for `UpstreamCRMAdapter` targeting Legal Server.
> Phase 6 deliverable. Use this doc to implement `packages/adapters/upstream-legalserver`.

---

## What Legal Server Is

Legal Server is a web-based case management system used by ~700 civil legal aid organizations. It is the sector's de facto standard for full-representation work. Most CARPLS partner agencies (LAF, Legal Aid Chicago, LOL, LAS, etc.) run Legal Server as their system of record for open cases.

The integration goal: our platform handles intake + conflict + referral; Legal Server handles open case lifecycle. When an engagement closes or is referred out, we push the outcome to Legal Server so partner agencies don't have to do double-entry.

---

## API Surface

Legal Server exposes three distinct API patterns. We use all three.

### 1. Core REST API (v1 / v2)

**Base URL:** `https://{site}.legalserver.org`
**Auth:** HTTP Basic (`username:password`) or Personal Access Token
**Rate limit:** 200 req/min (averaged over 2 min); returns 429 with headers:
- `x-rate-limit-limit`
- `x-rate-limit-remaining`
- `x-rate-limit-reset`

**API versions:**
- `v1` — stable, read-heavy, limited new features
- `v2` — active development, enabled everywhere; supports subtable custom fields, richer lookup objects, upsert via POST+`update` param
- `v3` — in active development, not yet generally available

**Core endpoints relevant to us:**

| Endpoint | Version | Tier | Notes |
|---|---|---|---|
| `GET /matters` (search) | v1/v2 | Free | Includes Assignment, Charge, Income, Litigation, Service records |
| `GET /matters/{uuid}` (get) | v1/v2 | Free | Full matter detail |
| `POST /matters` (create) | v1/v2 | **Premium** | $200/mo, requires LS staff enablement |
| `PATCH /matters/{uuid}` (update) | v1/v2 | **Premium** | |
| `POST /contacts` | v1/v2 | Free | Create/update person records |
| `POST /notes` | v1/v2 | Free | Create case notes |
| `GET /users` / `POST /users` | v1/v2 | Free | User management |
| Conflict Check | v1/v2 | Premium++ | Requires separate config beyond standard Premium |

**Null handling:** use `%empty%` (lowercase) to search for null or set a field to null via POST/PATCH.

**Upsert:** `POST /matters` with `update=1` parameter — searches and updates if found, creates if not. Available for Contact, Event, Matter, User endpoints.

**External ID fields (for idempotency):**
- Matters, Events, Charges, Services, Litigations: `external_id` (read-only in UI)
- Users, Organizations: `external_unique_id` (editable in UI, unique constraint enforced)

**Max results per page:** 100 (silently enforced in v2).

**v2 lookup objects** return:
```json
{
  "lookup_value_id": 42,
  "lookup_value_name": "Housing",
  "lookup_value_uuid": "...",
  "lookup_type_name": "Legal Problem Code",
  "lookup_type_table_name": "problem_codes",
  "lookup_type_custom": false,
  "lookup_type_uuid": "..."
}
```

### 2. Reports API

**Endpoint:** `https://{site}.legalserver.org/modules/report/api_export.php`
**Auth:** Basic auth
**Params:** `?load={report_id}&api_key={api_key}`
**Returns:** JSON (configurable; CSV also available)

The Reports API turns any saved LS report into an API endpoint. This is the **pull** mechanism — we configure a report in LS scoped to "matters updated since last sync" and poll it for inbound updates.

**Known field names in report exports:**
- `Database_ID` — integer primary key
- `UUID` / `uuid` — stable external reference
- `Case_Disposition` — `Open` | `Closed` | `Pending` | `Prescreen` | `Rejected` | `Incomplete Intake`
- `Case_Status`
- `Intake_Date`
- `Intake_Program`
- `Initial_Legal_Problem_Category`
- `Legal_Problem_Code`
- `Primary_Advocate`
- `Date_of_Latest__Opened__Intake__Prescreen_`
- Custom fields: column names contain "internal_ls_stuff" prefix pattern

### 3. Guided Navigation API (Outbound Webhooks FROM Legal Server)

Legal Server can POST to our platform when a matter reaches a specific workflow step. Configuration is per-site, done by LS admin.

**Request methods:** GET, POST, PATCH, PUT, DELETE
**Path params:** use `{field_name}` bracketed notation in URL template
**Auth:** configured directly (Basic, Bearer, or custom)
**Response:** LS can save response to case note or update case fields via jq filter

We should expose a webhook endpoint (`POST /api/webhooks/legalserver`) that LS admins can configure as a Guided Navigation step to notify us when case status changes.

---

## Data Model Mapping

### Our `Engagement` → Legal Server Matter

| Our field | LS field | Notes |
|---|---|---|
| `engagementId` | `external_id` | Store on create; use for idempotency |
| `person.firstName` | `first_name` / client first name | |
| `person.lastName` | `last_name` | |
| `person.dateOfBirth` | `date_of_birth` | ISO 8601 YYYY-MM-DD |
| `person.primaryPhone` | `phone_home` or `phone_cell` | |
| `person.address.line1` | `address` | |
| `person.address.city` | `city` | |
| `person.address.stateCode` | `state` | |
| `person.address.postalCode` | `zip_code` | |
| `lscProblemCode` | `legal_problem_code` | Must match LS lookup value ID or UUID |
| `lscSubproblemCode` | `legal_sub_problem_code` | Optional |
| `serviceType` | `case_type` or service record | Map to LS service type lookup |
| `closureReason` | `close_reason` | Map to LS lookup value |
| `outcome` | `case_disposition` / outcome field | |
| `openedAt` | `intake_date` | |
| `closedAt` | `close_date` | |
| `householdSize` | `household_size` | |
| `annualIncomeCents` | `income` | Convert cents → dollars |

### LSC Problem Code Transform

CARPLS's existing implementation (`LegalServerXmlCalloutCodeTransforms.cls`) maps our internal problem taxonomy to LS lookup value IDs. The transform is site-specific — each LS installation may have different lookup IDs for the same problem codes.

**Implementation approach:**
- Store LS lookup value UUIDs (not integer IDs) in our `EligibilityRuleSet.problemIds` field
- UUIDs are stable across LS upgrades; integer IDs are not
- Fetch current lookup values via `GET /lookups/problem_codes` on adapter init and cache

### Eligibility Fields in Legal Server

LS evaluates LSC eligibility using:
- **Income**: Client Income (with possible staff override) OR recalculated from FPL%
- **Household size**: with liquid asset cap (increases per additional member)
- **Citizenship status**: must be `Citizen` or eligible immigration status value
- **Legal Problem Code**: must be flagged as eligible in LS admin lookups
- **Conflict status**: must be `No Conflict`
- **Duplicate status**: must be `Not a Duplicate`

LS logs the date + user of any eligibility override automatically (audit trail built in).

---

## Integration Architecture (Phase 6)

```
Our Platform                        Legal Server
─────────────────────               ─────────────────────────────────
Engagement closes
  │
  ▼
UpstreamCRMAdapter.pushClosedEngagement()
  │  POST /matters (upsert)
  │  external_id = our engagementId
  │──────────────────────────────────►  Create/update matter
  │◄──────────────────────────────────  { uuid, external_id }
  │
  Store lsUuid in Engagement.externalId

Nightly sync job (Inngest):
  │
  ▼
UpstreamCRMAdapter.pullMatterUpdates(since)
  │  Reports API: GET /report?load={sync_report_id}
  │◄──────────────────────────────────  Updated matters since last sync
  │
  Update Engagement.status if changed in LS

Inbound webhook (when LS admin configures Guided Navigation):
  POST /api/webhooks/legalserver
  │◄──────────────────────────────────  Guided Navigation POST
  │
  Update Engagement / emit event
```

---

## CARPLS Existing Implementation (Reference, Not Port)

The existing CARPLS Salesforce implementation is **XML/SOAP** (older LS API):
- `LegalServerXmlCallout.cls` — SOAP callout with XML envelope
- `LegalServerXmlCalloutFactory.cls` — builds the XML request
- `LegalServerXmlCalloutCodeTransforms.cls` — maps CARPLS codes to LS codes
- `SendToLegalServerController.cls` — UI trigger
- `LegalServerRestService.cls` — newer REST approach (IL-AFLAN integration)
- Named credentials: `Legal_Server` (prod), `Legal_Server_Demo` (sandbox)

**Our implementation uses the REST API (not SOAP).** Do not port the XML callout code.
The `LegalServerXmlCalloutCodeTransforms.cls` contains the **problem code mappings** — extract those mappings as seed data for `packages/adapters/upstream-legalserver/src/transforms/problem-codes.ts`.

---

## Authentication Setup (Per-Site)

Each Legal Server site is a separate deployment (`{site}.legalserver.org`). Each agency using our platform that has LS needs its own adapter config:

```typescript
interface LegalServerAdapterConfig {
  siteUrl: string           // e.g., "https://acme.legalserver.org"
  username: string          // dedicated API user account
  password: string          // stored in secrets manager, never in DB
  syncReportId: number      // Report ID configured for matter pull
  apiVersion: 'v1' | 'v2'  // default v2
  problemCodeMap: Record<string, string> // our problemId → LS lookup UUID
}
```

Store `password` encrypted via environment secrets (Vercel env or equivalent). Store the rest in `Organization.settings` (encrypted at rest, per-tenant).

---

## Known Constraints

- **Premium API costs $200/month per LS site** — create/update endpoints are Premium. Our `pushClosedEngagement` needs the Premium tier. The pull (Reports API) and person lookup are free.
- **LS is multi-tenant in their own way** — each agency has a different subdomain. Our adapter config is per-`Organization` in our multi-tenant model.
- **Problem code IDs are site-specific** — use UUIDs, not integer IDs, and refresh the lookup cache periodically.
- **CARPLS currently uses XML/SOAP** — if/when CARPLS adopts this platform, they need a LS Premium API subscription and a REST-based config replacing their existing Apex callout.
- **Guided Navigation webhooks require LS admin config** — our adapter can't self-configure this; it must be documented for the partner agency's LS admin.
- **Rate limit matters at scale** — 200 req/min may bind for a large pull. Implement exponential backoff and respect `x-rate-limit-reset`.

---

## Useful Links

- [LegalServer API Help (overview)](https://help.legalserver.org/article/1686-apis-application-programming-interfaces)
- [Core APIs detail](https://help.legalserver.org/article/3197-core-apis)
- [API Getting Started](https://help.legalserver.org/article/3194-api-getting-started)
- [Guided Navigation API](https://help.legalserver.org/article/2310-guided-navigation-api-calls)
- [Third-party Integrations](https://help.legalserver.org/article/1863-third-party-integrations)
- [LSC Eligibility Block](https://help.legalserver.org/article/2000-lsc-eligibility-information-and-site-eligibility-information-block)
- [Stoplight API Docs (SPA, requires browser)](https://apidocs.legalserver.org)

---

*Last researched: 2026-04-23. LegalServer API is actively evolving — re-verify endpoint paths against Stoplight before Phase 6 implementation.*
