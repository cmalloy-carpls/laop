import type { EmailAddress, ISODateTimeString } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface ESignatureAdapter {
  createEnvelope(params: CreateEnvelopeParams): Promise<Result<CreateEnvelopeResult>>
  getEnvelopeStatus(envelopeId: string): Promise<Result<EnvelopeStatus>>
  getSignedDocument(envelopeId: string): Promise<Result<Buffer>>
  voidEnvelope(envelopeId: string, reason: string): Promise<Result<void>>
  /** Returns a one-time signing URL for embedded signing */
  getSigningUrl(envelopeId: string, recipientEmail: EmailAddress): Promise<Result<string>>
}

export interface CreateEnvelopeParams {
  subject: string
  message?: string
  documents: EnvelopeDocument[]
  signers: EnvelopeSigner[]
  /** If true, returns a URL for embedded signing rather than sending email */
  embeddedSigning?: boolean
}

export interface EnvelopeDocument {
  id: string
  name: string
  content: Buffer
  mimeType: 'application/pdf'
}

export interface EnvelopeSigner {
  email: EmailAddress
  name: string
  order: number
}

export interface CreateEnvelopeResult {
  envelopeId: string
  status: EnvelopeStatusCode
  /** Set when embeddedSigning === true */
  signingUrl: string | null
}

export type EnvelopeStatusCode = 'created' | 'sent' | 'delivered' | 'completed' | 'declined' | 'voided'

export interface EnvelopeStatus {
  envelopeId: string
  status: EnvelopeStatusCode
  completedAt: ISODateTimeString | null
  signers: Array<{
    email: EmailAddress
    status: 'pending' | 'signed' | 'declined'
    signedAt: ISODateTimeString | null
  }>
}
