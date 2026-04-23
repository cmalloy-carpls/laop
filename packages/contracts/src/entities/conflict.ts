import type {
  ConflictId, OrganizationId, EngagementId, PartyId, UserId,
  ISODateTimeString,
} from '../shared/branded.js'

/** Red = hard conflict; Orange/Yellow = review required; Green = cleared */
export type ConflictTier = 'red' | 'orange' | 'yellow' | 'green'

export type ConflictMatchType =
  | 'exact-name'
  | 'alias-name'
  | 'fuzzy-name'
  | 'dob-proximity'
  | 'address'
  | 'compound'

export type ConflictStatus =
  | 'pending-review'
  | 'confirmed'
  | 'cleared'
  | 'overridden'

export interface Conflict {
  id: ConflictId
  organizationId: OrganizationId
  engagementId: EngagementId
  /** The party currently being onboarded */
  sourcePartyId: PartyId
  /** The existing party that triggered the match */
  matchedPartyId: PartyId
  tier: ConflictTier
  matchType: ConflictMatchType
  /** Normalized match score 0–1 */
  matchScore: number
  status: ConflictStatus
  reviewedByUserId: UserId | null
  reviewedAt: ISODateTimeString | null
  /** Required when status === 'overridden' */
  resolution: string | null
  /** True when matchedParty belongs to a different org (federated conflict) */
  isCrossOrg: boolean
  sourceOrganizationId: OrganizationId | null
  detectedAt: ISODateTimeString
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/** Privacy-preserving token used in cross-org federated conflict queries */
export interface ConflictToken {
  /** HMAC of (lastName + dateOfBirth) under org-specific key */
  nameToken: string
  /** HMAC of dateOfBirth alone */
  dobToken: string | null
  organizationId: OrganizationId
  partyId: PartyId
}
