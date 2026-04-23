import type {
  EligibilityCheckId, OrganizationId, EngagementId, ProgramId, UserId,
  ISODateTimeString, Cents,
} from '../shared/branded.js'

export type EligibilityCriterion =
  | 'income'
  | 'geography'
  | 'problem-scope'
  | 'priority'
  | 'capacity'
  | 'citizenship'
  | 'age'
  | 'other'

export interface EligibilityReason {
  criterion: EligibilityCriterion
  passed: boolean
  detail: string | null
}

export interface EligibilityCheck {
  id: EligibilityCheckId
  organizationId: OrganizationId
  engagementId: EngagementId
  programId: ProgramId
  eligible: boolean
  reasons: EligibilityReason[]
  /** Snapshots at time of check — for audit/appeals */
  incomeAtCheck: Cents | null
  householdSizeAtCheck: number | null
  /** Federal poverty level percentage at time of check */
  povertyPctAtCheck: number | null
  checkedAt: ISODateTimeString
  checkedByUserId: UserId | null
  /** System vs. staff override */
  method: 'automated' | 'staff-override'
}

export interface EligibilityRuleSet {
  programId: ProgramId
  /** Max poverty level % (e.g., 200 = 200% FPL) */
  maxPovertyPct: number | null
  /** County FIPS codes the program serves — null means statewide */
  serviceCounties: string[] | null
  problemIds: string[]
  requiresCitizenship: boolean
  minAge: number | null
  maxAge: number | null
  priorityCodes: string[]
}
