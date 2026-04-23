import type { OrganizationId, ISODateTimeString } from '../shared/branded.js'

export type OperatingProfile =
  | 'hotline'
  | 'field-office'
  | 'full-representation'
  | 'collaborative-network'
  | 'self-help'

export type OrganizationStatus = 'active' | 'suspended' | 'archived'

export interface Organization {
  id: OrganizationId
  name: string
  slug: string
  status: OrganizationStatus
  profiles: OperatingProfile[]
  /** IANA timezone — used for scheduling, reporting periods */
  timezone: string
  /** Primary state of operation — ISO 3166-2 (e.g., "US-IL") */
  primaryJurisdiction: string | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  profiles: OperatingProfile[]
  timezone: string
  primaryJurisdiction?: string
}
