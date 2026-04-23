# Legal Server — UpstreamCRM Adapter Implementation Guide

> Reference implementation for `UpstreamCRMAdapter` targeting Legal Server.
> Phase 6 deliverable. Use this doc to implement `packages/adapters/upstream-legalserver`.
>
> **Schema sourced from:** Stoplight (`apidocs.legalserver.org`) via Playwright scrape on 2026-04-23.
> Field names are canonical. All previous mappings from help articles only were speculative — this is authoritative.

---

## What Legal Server Is

Legal Server is a web-based case management system used by ~700 civil legal aid organizations. It is the sector's de facto standard for full-representation work. Most CARPLS partner agencies (LAF, Legal Aid Chicago, LOL, LAS, etc.) run Legal Server as their system of record for open cases.

The integration goal: our platform handles intake + conflict + referral; Legal Server handles open case lifecycle. When an engagement closes or is referred out, we push the outcome to Legal Server so partner agencies don't have to do double-entry.

---

## API Surface

Legal Server exposes three distinct API patterns. We use all three.

### 1. Core REST API (v1 / v2)

**Base URL:** `https://{site}.legalserver.org`
**Auth:** HTTP Basic (`username:password`) or Personal Access Token (Bearer)
**Rate limit:** 200 req/min (averaged over 2 min); returns 429 with headers:
- `x-rate-limit-limit`
- `x-rate-limit-remaining`
- `x-rate-limit-reset`

**API versions:**
- `v1` — stable, read-heavy, limited new features
- `v2` — active development, enabled everywhere; supports subtable custom fields, richer lookup objects, upsert via `update` param, `update_data` param (new 2026-04)
- `v3` — in active development, not yet generally available

**Permission errors:** v2 returns `403 Forbidden` (with the missing permission name) for authorization errors; `401 Unauthorized` only for authentication errors. v1 uses 401 for both.

**Core endpoints relevant to us:**

| Endpoint | Method | Version | Tier | Notes |
|---|---|---|---|---|
| `/api/v2/matters` | GET (search) | v1/v2 | Included | Paginated, max 100/page |
| `/api/v2/matters/{matter_uuid}` | GET | v1/v2 | Included | Full matter detail |
| `/api/v2/matters` | POST (create) | v1/v2 | **Premium** | $200/mo, requires LS staff enablement |
| `/api/v2/matters/{matter_uuid}` | PATCH (update) | v1/v2 | **Premium** | |
| `/api/v2/contacts` | POST | v1/v2 | Included | Create/update person records |
| `/api/v2/notes` | POST | v1/v2 | Included | Create case notes |
| `/api/v2/users` | GET/POST | v1/v2 | Included | User management |
| Conflict Check | — | v1/v2 | Premium++ | Requires separate config beyond standard Premium |

**Null handling:** use `%empty%` (lowercase) to search for null; send `null` JSON value to clear a field via PATCH.

**Upsert (POST with match):**
```json
POST /api/v2/matters
{
  "first": "Jane",
  "last": "Doe",
  "case_disposition": "Closed",
  "external_id": "our-engagement-uuid",
  "update": {
    "external_id": "our-engagement-uuid"
  },
  "update_data": {
    "date_closed": "2026-04-23",
    "close_reason": "Advice Only"
  }
}
```
- `update` object — fields to match/search on for an existing record
- `update_data` object (v2, added 2026-04) — fields to apply if a match is found; if omitted, the top-level POST body is used for both create and update
- If matched: update. If not matched: create.

**External ID fields (for idempotency):**
- Matters: `external_id` — "linking id for an integration; searchable and editable" — matter-level
- Matters: `client_external_id` — links to the client/person record's `external_id`
- Users, Organizations: `external_unique_id` — editable in UI, unique constraint enforced

**Max results per page:** 100 (silently enforced in v2).

**v2 lookup objects** (returned in GET responses):
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

When **writing** lookup fields, you can send:
- `"Housing"` — lookup value name (string)
- `42` — lookup value integer ID (not stable across LS upgrades)
- `{ "lookup_value_uuid": "..." }` — UUID-keyed object (stable, preferred)

### 2. Reports API

**Endpoint:** `https://{site}.legalserver.org/modules/report/api_export.php`
**Auth:** Basic auth
**Params:** `?load={report_id}&api_key={api_key}`
**Returns:** JSON (configurable; CSV also available)

The Reports API turns any saved LS report into an API endpoint. This is the **pull** mechanism — configure a report in LS scoped to "matters updated since last sync" and poll it.

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

Expose: `POST /api/webhooks/legalserver` — LS admins configure this as a Guided Navigation step to notify us when case status changes.

---

## Data Model Mapping

### Our `Engagement` → Legal Server Matter (v2 field names, canonical)

| Our field | LS field | Type | Notes |
|---|---|---|---|
| `engagementId` | `external_id` | `string\|null` | Store on create; use as upsert match key |
| `person.firstName` | `first` | `string\|null` | **Not** `first_name` |
| `person.lastName` | `last` | `string\|null` | **Not** `last_name` |
| `person.middleName` | `middle` | `string\|null` | |
| `person.dateOfBirth` | `date_of_birth` | `string<date>` | ISO 8601 YYYY-MM-DD |
| `person.primaryPhone` | `home_phone` or `mobile_phone` | `string\|null` | `>= 1 characters`; also `work_phone`, `other_phone` |
| `person.address.line1` | `home_street` | `string\|null` | **Not** `address` |
| `person.address.line2` | `home_apt_num` | `string\|null` | |
| `person.address.city` | `home_city` | `string\|null` | **Not** `city` |
| `person.address.stateCode` | `home_state` | `string\|null` | **Not** `state` |
| `person.address.postalCode` | `home_zip` | `string\|null` | **Not** `zip_code` |
| `lscProblemCode` | `legal_problem_code` | lookup | String name, int ID, or `{lookup_value_uuid}` object |
| `lscSubproblemCode` | `special_legal_problem_code` | lookup | Optional |
| `closureReason` | `close_reason` | lookup | String name of LS close reason lookup value |
| `outcome` | `case_disposition` | lookup | **Required** — `Open`/`Closed`/`Prescreen`/`Rejected`/`Incomplete Intake` |
| `openedAt` | `intake_date` | `string<date>` | Also set `date_opened` |
| `closedAt` | `date_closed` | `string<date>` | |
| `numberOfAdults` | `number_of_adults` | `integer\|null` | **No `household_size` field** — split into adults + children |
| `numberOfChildren` | `number_of_children` | `integer\|null` | |
| `annualIncomeCents` | via `incomes[]` | `array[object]` | Income is a sub-record array, not a flat field — see below |
| `programId` | `intake_program` | lookup | LS program lookup value name |
| `officeId` | `intake_office` | lookup | LS office name |

### Income Records

Income in LS is stored as an array of `incomes` sub-objects on the matter, not a single flat field. Each record has:
- `income_type` — lookup (employment, SSI, SSDI, etc.)
- `amount` — number (dollars, not cents)
- `frequency` — lookup (monthly, annual, etc.)

For our integration, we send a single income record derived from `annualIncomeCents`:
```json
"incomes": [{
  "income_type": "Employment",
  "amount": 42000,
  "frequency": "Annual"
}]
```

The computed `adjusted_percentage_of_poverty` and `income_eligible` fields are **read-only** on the matter — LS calculates them from the income + household records.

### LSC Problem Code Transform

The LS problem code lookup expects either the string name (e.g., `"Housing"`) or a UUID from that LS site's lookup table. UUIDs are stable across LS upgrades; integer IDs are not.

**Implementation approach:**
- Store LS lookup value UUIDs in `EligibilityRuleSet.problemIds`
- Fetch current lookup values via `GET /api/v2/lookups/problem_codes` on adapter init and cache (refresh nightly)
- Send as `{ "lookup_value_uuid": "..." }` in POST body

### Upsert Pattern (idempotent push)

```typescript
const body = {
  first: engagement.person.firstName,
  last: engagement.person.lastName,
  case_disposition: 'Closed',
  intake_date: formatDate(engagement.openedAt),
  date_closed: formatDate(engagement.closedAt),
  external_id: engagement.engagementId,
  legal_problem_code: { lookup_value_uuid: config.problemCodeMap[engagement.lscProblemCode] },
  close_reason: mapCloseReason(engagement.closureReason),
  number_of_adults: engagement.numberOfAdults,
  number_of_children: engagement.numberOfChildren,
  home_phone: engagement.person.primaryPhone,
  home_street: engagement.person.address?.line1,
  home_city: engagement.person.address?.city,
  home_state: engagement.person.address?.stateCode,
  home_zip: engagement.person.address?.postalCode,
  date_of_birth: engagement.person.dateOfBirth,
  intake_program: config.programName,
  intake_office: config.officeName,
  // Upsert: match on external_id, update only close fields if matched
  update: { external_id: engagement.engagementId },
  update_data: {
    case_disposition: 'Closed',
    date_closed: formatDate(engagement.closedAt),
    close_reason: mapCloseReason(engagement.closureReason),
  }
}
```

### Eligibility Fields in Legal Server

LS evaluates LSC eligibility using:
- **Income**: via `incomes[]` sub-records; `adjusted_percentage_of_poverty` is computed read-only
- **Household size**: `number_of_adults` + `number_of_children` (no single `household_size` field)
- **Citizenship status**: `citizenship` lookup; `immigration_status` lookup
- **Legal Problem Code**: `legal_problem_code` must be flagged as eligible in LS admin lookups
- **Conflict status**: `client_conflict_status` (boolean) + `conflict_status_note` — we send these from our conflict check result
- **Duplicate status**: internal LS check

LS logs the date + user of any eligibility override automatically.

---

## Integration Architecture (Phase 6)

```
Our Platform                        Legal Server
─────────────────────               ─────────────────────────────────
Engagement closes
  │
  ▼
UpstreamCRMAdapter.pushClosedEngagement()
  │  POST /api/v2/matters (upsert)
  │  external_id = our engagementId
  │  update: { external_id: engagementId }
  │──────────────────────────────────►  Create/update matter
  │◄──────────────────────────────────  { matter_uuid, external_id, ... }
  │
  Store lsUuid in Engagement.externalId

Nightly sync job (Inngest):
  │
  ▼
UpstreamCRMAdapter.pullMatterUpdates(since)
  │  Reports API: GET /modules/report/api_export.php?load={syncReportId}
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

**Our implementation uses the REST API (not SOAP).** The `LegalServerXmlCalloutCodeTransforms.cls` contains **problem code mappings** — extract those as seed data for `packages/adapters/upstream-legalserver/src/transforms/problem-codes.ts`.

---

## Authentication Setup (Per-Site)

Each Legal Server site is a separate deployment (`{site}.legalserver.org`). Each agency that has LS needs its own adapter config:

```typescript
interface LegalServerAdapterConfig {
  siteUrl: string           // e.g., "https://acme.legalserver.org"
  username: string          // dedicated API user account
  password: string          // stored in secrets manager, never in DB
  syncReportId: number      // Report ID configured for matter pull
  apiVersion: 'v1' | 'v2'  // default v2
  programName: string       // LS intake_program lookup value name for this org
  officeName: string        // LS intake_office lookup value name
  problemCodeMap: Record<string, string> // our problemId → LS lookup_value_uuid
}
```

Store `password` encrypted via environment secrets (Vercel env or equivalent). Store the rest in `Organization.settings` (encrypted at rest, per-tenant).

---

## Complete v2 POST /matters Field Reference

These are all writable fields from the Stoplight schema (2026-04-23). Fields marked `required` per the API docs.

### Client identity
| Field | Type | Notes |
|---|---|---|
| `first` | `string\|null` | **required** (or `organization_name` if `is_group`) |
| `last` | `string\|null` | **required** (or `organization_name` if `is_group`) |
| `middle` | `string\|null` | |
| `suffix` | `string\|null` | |
| `prefix` | lookup | |
| `is_group` | `boolean` | Default false; use `organization_name` if true |
| `organization_name` | `string\|null` | Required if `is_group=true` |
| `client_id` | `integer` | Backend ID; use to associate with existing client record |
| `client_external_id` | `string` | Our person/client external ID |
| `date_of_birth` | `string<date>` | |
| `ssn` | `string` | |
| `client_email_address` | `string<email>` | |
| `client_gender` | lookup | |
| `language` | lookup | |
| `second_language` | lookup | |
| `race` | lookup | |
| `ethnicity` | lookup | |
| `immigration_status` | lookup | |
| `citizenship` | lookup | |
| `a_number` | `string\|null` | Alien registration number |
| `visa_number` | `string\|null` | |
| `veteran` | `boolean\|null` | |
| `disabled` | `boolean\|null` | |
| `marital_status` | lookup | |

### Address
| Field | Type | Notes |
|---|---|---|
| `home_street` | `string\|null` | |
| `home_apt_num` | `string\|null` | |
| `home_street_2` | `string\|null` | |
| `home_city` | `string\|null` | |
| `home_state` | `string\|null` | |
| `home_zip` | `string\|null` | |
| `home_address_safe` | `boolean\|null` | Domestic violence safety flag |
| `mailing_street` | `string\|null` | |
| `mailing_apt_num` | `string\|null` | |
| `mailing_city` | `string\|null` | |
| `mailing_state` | `string\|null` | |
| `mailing_zip` | `string\|null` | |

### Phone
| Field | Type | Notes |
|---|---|---|
| `home_phone` | `string\|null` | `>= 1 characters` |
| `mobile_phone` | `string\|null` | |
| `work_phone` | `string\|null` | |
| `other_phone` | `string\|null` | |
| `fax_phone` | `string\|null` | |
| `preferred_phone_number` | lookup | Which phone is preferred |
| `*_phone_safe` | `boolean\|null` | Safety flag per phone |

### Case / matter core
| Field | Type | Notes |
|---|---|---|
| `case_disposition` | lookup | **required** — `Open`/`Closed`/`Prescreen`/`Rejected`/`Incomplete Intake` |
| `case_title` | `string\|null` | |
| `case_type` | lookup | |
| `cause_number` | `string\|null` | Court cause number |
| `court_tracking_numbers` | `string\|null` | |
| `intake_date` | `string<date>\|null` | Defaults based on `case_disposition` |
| `date_opened` | `string<date>\|null` | |
| `date_closed` | `string<date>\|null` | |
| `date_rejected` | `string<date>\|null` | |
| `rejected` | `boolean\|null` | |
| `rejection_reason` | lookup | |
| `close_reason` | lookup | |
| `external_id` | `string\|null` | **Our primary integration key** |
| `legal_problem_code` | lookup | String name, integer ID, or `{lookup_value_uuid}` |
| `special_legal_problem_code` | lookup | Sub-problem |
| `legal_problem_category` | lookup | |
| `how_referred` | lookup | |
| `intake_office` | lookup | Office name |
| `intake_program` | lookup | Program name |
| `intake_user` | `integer\|string\|object` | LS user ID or object |
| `emergency` | `boolean\|null` | |
| `impact` | `boolean\|null` | Impact case flag |
| `rural` | `boolean\|null` | |
| `fee_generating` | `boolean\|null` | |
| `pai_case` | `boolean\|null` | Pro bono PAI |
| `is_lead_case` | `boolean` | Lead case in multi-case group |
| `sending_site_identification_number` | `string\|null` | For cross-site transfers |
| `api_integration_preference` | `string\|null` | |

### Household & income (write)
| Field | Type | Notes |
|---|---|---|
| `number_of_adults` | `integer\|null` | No single `household_size` field |
| `number_of_children` | `integer\|null` | |
| `incomes` | `array[object]` | Income sub-records (type, amount, frequency) |
| `assets` | `array[object]` | Asset sub-records |
| `expenses` | `array[object]` | Expense sub-records |

### Household & income (read-only computed)
| Field | Type | Notes |
|---|---|---|
| `adjusted_percentage_of_poverty` | number | Computed from incomes + household |
| `percentage_of_poverty` | number | Read-only |
| `income_eligible` | `boolean\|null` | |
| `asset_eligible` | `boolean\|null` | |
| `lsc_eligible` | `boolean\|null` | |
| `total_liquid_assets` | number | |
| `total_non_liquid_assets` | number | |
| `total_annual_expenses` | number | |
| `total_monthly_expenses` | number | |

### Conflict
| Field | Type | Notes |
|---|---|---|
| `client_conflict_status` | `boolean\|null` | True = conflict found |
| `conflict_status_note` | `string\|null` | |
| `adverse_party_conflict_status` | `boolean\|null` | |
| `conflict_status_note_ap` | `string\|null` | |
| `conflict_waived` | `boolean\|null` | |
| `ap_conflict_waived` | `boolean\|null` | |

### Upsert parameters
| Field | Type | Notes |
|---|---|---|
| `update` | `object` | Fields to match on for upsert; searchable fields include: `external_id`, `case_id`, `case_number`, `first`, `last`, `date_of_birth`, `ssn`, `legal_problem_code`, `phone_number` |
| `update_data` | `v2_core_matter_patch` | Fields to write on match (v2, 2026-04+); if omitted, top-level body used |

---

## Known Constraints

- **Premium API costs $200/month per LS site** — create/update matter endpoints are Premium.
- **LS is multi-tenant** — each agency has a different subdomain. Config is per-`Organization`.
- **Problem code IDs are site-specific** — use lookup UUIDs, not integer IDs.
- **No single `household_size` field** — must use `number_of_adults` + `number_of_children`.
- **Income is a sub-object array** — not a flat field; send via `incomes: [{ income_type, amount, frequency }]`.
- **Address field names** — `home_street`/`home_city`/`home_state`/`home_zip` (not `address`/`city`/`state`/`zip_code`).
- **Name field names** — `first`/`last` (not `first_name`/`last_name`).
- **CARPLS currently uses XML/SOAP** — if/when CARPLS adopts this platform, they need LS Premium API subscription + REST config replacing existing Apex callout.
- **Guided Navigation webhooks require LS admin config** — document for partner agency LS admins.
- **Rate limit matters at scale** — 200 req/min. Implement exponential backoff and respect `x-rate-limit-reset`.
- **Legacy APIs being removed in 2026** — do not use any `matter/api/*` legacy endpoints; use Core APIs only.

---

## Useful Links

- [LegalServer API Help (overview)](https://help.legalserver.org/article/1686-apis-application-programming-interfaces)
- [Core APIs detail](https://help.legalserver.org/article/3197-core-apis)
- [API Getting Started](https://help.legalserver.org/article/3194-api-getting-started)
- [Guided Navigation API](https://help.legalserver.org/article/2310-guided-navigation-api-calls)
- [Third-party Integrations](https://help.legalserver.org/article/1863-third-party-integrations)
- [LSC Eligibility Block](https://help.legalserver.org/article/2000-lsc-eligibility-information-and-site-eligibility-information-block)
- [Stoplight API Docs (SPA, requires browser)](https://apidocs.legalserver.org) — canonical source; scraped 2026-04-23

---

*Schema sourced from Stoplight via Playwright 2026-04-23. Re-verify at Stoplight before Phase 6 implementation — LS releases weekly and field additions are common.*
