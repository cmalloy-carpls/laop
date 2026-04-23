import type { EmailAddress } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface EmailAdapter {
  send(params: SendEmailParams): Promise<Result<SendEmailResult>>
  sendTemplate(params: SendTemplateEmailParams): Promise<Result<SendEmailResult>>
}

export interface EmailRecipient {
  address: EmailAddress
  name?: string
}

export interface SendEmailParams {
  from: EmailRecipient
  to: EmailRecipient[]
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  subject: string
  text: string
  html?: string
  attachments?: EmailAttachment[]
  tags?: Record<string, string>
}

export interface SendTemplateEmailParams {
  from: EmailRecipient
  to: EmailRecipient[]
  templateId: string
  variables: Record<string, unknown>
  tags?: Record<string, string>
}

export interface SendEmailResult {
  messageId: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType: string
}
