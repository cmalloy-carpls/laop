import type {
  DocumentId, OrganizationId, MatterId, EngagementId, UserId,
  ISODateTimeString,
} from '../shared/branded.js'

export type DocumentStatus = 'pending' | 'ready' | 'signed' | 'failed' | 'deleted'
export type DocumentSource  = 'upload' | 'generated' | 'received'

export interface Document {
  id: DocumentId
  organizationId: OrganizationId
  matterId: MatterId | null
  engagementId: EngagementId | null
  label: string
  mimeType: string
  sizeBytes: number
  storageKey: string
  source: DocumentSource
  status: DocumentStatus
  /** Template ID used when source === 'generated' */
  templateId: string | null
  /** E-signature envelope ID when status === 'signed' */
  signatureEnvelopeId: string | null
  uploadedByUserId: UserId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
