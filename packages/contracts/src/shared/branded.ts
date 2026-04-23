declare const __brand: unique symbol

export type Brand<T, B extends string> = T & { readonly [__brand]: B }

// Entity IDs
export type OrganizationId = Brand<string, 'OrganizationId'>
export type UserId          = Brand<string, 'UserId'>
export type PersonId        = Brand<string, 'PersonId'>
export type MatterId        = Brand<string, 'MatterId'>
export type EngagementId    = Brand<string, 'EngagementId'>
export type PartyId         = Brand<string, 'PartyId'>
export type ProblemId       = Brand<string, 'ProblemId'>
export type ConflictId      = Brand<string, 'ConflictId'>
export type ReferralId      = Brand<string, 'ReferralId'>
export type EligibilityCheckId = Brand<string, 'EligibilityCheckId'>
export type KnowledgeAtomId = Brand<string, 'KnowledgeAtomId'>
export type DocumentId      = Brand<string, 'DocumentId'>
export type FunderId        = Brand<string, 'FunderId'>
export type ProgramId       = Brand<string, 'ProgramId'>
export type AuditEventId    = Brand<string, 'AuditEventId'>
export type CommunicationEventId = Brand<string, 'CommunicationEventId'>

// External IDs (adapter-sourced)
export type CallId          = Brand<string, 'CallId'>
export type RecordingId     = Brand<string, 'RecordingId'>
export type ExternalMatterId = Brand<string, 'ExternalMatterId'>

// Temporal
export type ISODateString     = Brand<string, 'ISODateString'>      // YYYY-MM-DD
export type ISODateTimeString = Brand<string, 'ISODateTimeString'>  // ISO 8601 with TZ

// Communication
export type E164PhoneNumber = Brand<string, 'E164PhoneNumber'>      // +12125551234
export type EmailAddress    = Brand<string, 'EmailAddress'>

// Geography
export type CountyFips  = Brand<string, 'CountyFips'>  // 5-digit FIPS
export type StateCode   = Brand<string, 'StateCode'>   // 2-letter ISO
export type PostalCode  = Brand<string, 'PostalCode'>

// Finance — always in cents to avoid float issues
export type Cents = Brand<number, 'Cents'>

// Helper constructors — use only at trust boundaries (e.g., DB reads, form parsing)
export const asOrganizationId = (s: string): OrganizationId => s as OrganizationId
export const asPersonId       = (s: string): PersonId => s as PersonId
export const asMatterId       = (s: string): MatterId => s as MatterId
export const asEngagementId   = (s: string): EngagementId => s as EngagementId
export const asISODate        = (s: string): ISODateString => s as ISODateString
export const asISODateTime    = (s: string): ISODateTimeString => s as ISODateTimeString
export const asE164           = (s: string): E164PhoneNumber => s as E164PhoneNumber
export const asCents          = (n: number): Cents => n as Cents
