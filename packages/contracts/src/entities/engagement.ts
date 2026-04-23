import type {
  EngagementId, OrganizationId, MatterId, ProgramId, UserId,
  ISODateTimeString,
} from '../shared/branded.js'

export type ServiceType =
  | 'brief-advice'
  | 'limited-action'
  | 'extended-service'
  | 'full-representation'
  | 'information'
  | 'referral-only'

export type EngagementStatus =
  | 'intake'
  | 'conflict-check'
  | 'eligible'
  | 'ineligible'
  | 'open'
  | 'closed'
  | 'referred'

export type ClosureReason =
  | 'service-rendered'
  | 'referred-out'
  | 'client-withdrew'
  | 'ineligible'
  | 'conflict'
  | 'no-show'
  | 'other'

export type EngagementOutcome =
  | 'favorable'
  | 'unfavorable'
  | 'mixed'
  | 'incomplete'
  | 'pending'

export interface Engagement {
  id: EngagementId
  organizationId: OrganizationId
  matterId: MatterId
  programId: ProgramId | null
  serviceType: ServiceType
  status: EngagementStatus
  assignedUserId: UserId | null
  openedAt: ISODateTimeString
  closedAt: ISODateTimeString | null
  closureReason: ClosureReason | null
  outcome: EngagementOutcome | null
  /** Free-text note captured at closure */
  closureNote: string | null
  /** LSC required fields */
  lscProblemCode: string | null
  lscSubproblemCode: string | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreateEngagementInput {
  matterId: MatterId
  programId?: ProgramId
  serviceType: ServiceType
  assignedUserId?: UserId
}

export interface CloseEngagementInput {
  closureReason: ClosureReason
  outcome: EngagementOutcome
  closureNote?: string
  lscProblemCode?: string
  lscSubproblemCode?: string
}
