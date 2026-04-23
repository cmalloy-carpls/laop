import type { E164PhoneNumber, OrganizationId, ISODateTimeString } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface MessagingAdapter {
  sendSms(params: SendSmsParams): Promise<Result<SendSmsResult>>
  /** Called by inbound webhook handler */
  handleInboundSms(payload: InboundSmsPayload): Promise<Result<InboundSmsResult>>
  checkConsent(phoneNumber: E164PhoneNumber, organizationId: OrganizationId): Promise<Result<ConsentStatus>>
  recordConsent(params: RecordConsentParams): Promise<Result<void>>
  revokeConsent(params: RevokeConsentParams): Promise<Result<void>>
}

export interface SendSmsParams {
  to: E164PhoneNumber
  from: E164PhoneNumber
  body: string
  organizationId: OrganizationId
}

export interface SendSmsResult {
  messageId: string
  status: 'queued' | 'sent' | 'delivered' | 'failed'
}

export interface InboundSmsPayload {
  messageId: string
  from: E164PhoneNumber
  to: E164PhoneNumber
  body: string
  receivedAt: ISODateTimeString
  rawPayload: Record<string, unknown>
}

export interface InboundSmsResult {
  messageId: string
  /** TwiML or equivalent response if a reply is warranted */
  response: string | null
}

export type ConsentStatus = 'opted-in' | 'opted-out' | 'unknown'

export interface RecordConsentParams {
  phoneNumber: E164PhoneNumber
  organizationId: OrganizationId
  consentGivenAt: ISODateTimeString
  consentSource: 'verbal' | 'sms-keyword' | 'web-form' | 'staff-recorded'
}

export interface RevokeConsentParams {
  phoneNumber: E164PhoneNumber
  organizationId: OrganizationId
  revokedAt: ISODateTimeString
  source: 'stop-keyword' | 'staff-recorded' | 'client-request'
}
