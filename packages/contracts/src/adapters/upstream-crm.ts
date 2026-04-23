import type { ExternalMatterId, ISODateTimeString } from '../shared/branded.js'
import type { Result } from '../shared/result.js'
import type { PersonName } from '../entities/person.js'
import type { EngagementOutcome, ClosureReason } from '../entities/engagement.js'

/**
 * Contract for bidirectional sync with an upstream case management system.
 * Reference implementation: Legal Server (XML/SOAP).
 * Other possible implementations: Salesforce, Clio, plain CSV.
 */
export interface UpstreamCRMAdapter {
  /** Human-readable system identifier for logging and UI */
  readonly systemName: string

  /** Push a closed engagement to the upstream system */
  pushClosedEngagement(params: PushEngagementParams): Promise<Result<PushResult>>

  /** Pull matter updates from the upstream system since a given timestamp */
  pullMatterUpdates(since: ISODateTimeString): Promise<Result<ExternalMatterUpdate[]>>

  /** Look up a person in the upstream system by name / DOB */
  lookupPerson(params: PersonLookupParams): Promise<Result<ExternalPerson[]>>

  /** Check connectivity / auth — useful for admin health checks */
  ping(): Promise<Result<void>>
}

export interface PushEngagementParams {
  /** Our internal Engagement ID — for idempotency */
  engagementId: string
  person: {
    firstName: string
    lastName: string
    dateOfBirth: string | null
    primaryPhone: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
  lscProblemCode: string
  lscSubproblemCode: string | null
  serviceType: string
  closureReason: ClosureReason
  outcome: EngagementOutcome
  openedAt: ISODateTimeString
  closedAt: ISODateTimeString
  householdSize: number | null
  annualIncomeCents: number | null
}

export interface PushResult {
  externalId: ExternalMatterId
  /** URL in the upstream system, if available */
  externalUrl: string | null
}

export interface ExternalMatterUpdate {
  externalId: ExternalMatterId
  status: string
  updatedAt: ISODateTimeString
  fields: Record<string, unknown>
}

export interface PersonLookupParams {
  name: PersonName
  dateOfBirth?: string
}

export interface ExternalPerson {
  externalId: string
  name: PersonName
  dateOfBirth: string | null
  matters: Array<{ externalId: ExternalMatterId; status: string }>
}
