import type {
  FunderId, ProgramId, OrganizationId,
  ISODateString, ISODateTimeString,
} from '../shared/branded.js'

export type FunderType =
  | 'lsc'         // Legal Services Corporation
  | 'iolta'       // Interest on Lawyer Trust Accounts
  | 'state-bar'
  | 'foundation'
  | 'government'  // Non-LSC federal/state/local
  | 'other'

export interface Funder {
  id: FunderId
  organizationId: OrganizationId
  name: string
  type: FunderType
  /** Reporting period start — MM-DD */
  reportingPeriodStart: string
  /** Reporting period end — MM-DD */
  reportingPeriodEnd: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface Program {
  id: ProgramId
  organizationId: OrganizationId
  funderId: FunderId
  name: string
  description: string | null
  isActive: boolean
  startDate: ISODateString | null
  endDate: ISODateString | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
