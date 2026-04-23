import type {
  ReferralId, OrganizationId, EngagementId, UserId,
  ISODateTimeString,
} from '../shared/branded.js'

export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'closed'
  | 'expired'

export interface Referral {
  id: ReferralId
  sourceOrganizationId: OrganizationId
  sourceEngagementId: EngagementId
  destinationOrganizationId: OrganizationId
  /** Null until the destination org accepts and creates an Engagement */
  destinationEngagementId: EngagementId | null
  status: ReferralStatus
  /** Free-text reason for referral */
  referralNote: string | null
  /** Outcome narrative from destination org */
  outcomeNote: string | null
  documentsTransferred: boolean
  sentAt: ISODateTimeString
  respondedAt: ISODateTimeString | null
  closedAt: ISODateTimeString | null
  sentByUserId: UserId
  respondedByUserId: UserId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreateReferralInput {
  sourceEngagementId: EngagementId
  destinationOrganizationId: OrganizationId
  referralNote?: string
  documentsToTransfer?: string[]
}

export interface RespondToReferralInput {
  status: 'accepted' | 'declined'
  note?: string
}
