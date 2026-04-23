import type {
  PersonId, OrganizationId,
  ISODateString, ISODateTimeString,
  E164PhoneNumber, EmailAddress,
  PostalCode, StateCode, CountyFips,
  Cents,
} from '../shared/branded.js'

export interface PersonName {
  first: string
  middle: string | null
  last: string
  suffix: string | null
}

export interface Phone {
  number: E164PhoneNumber
  type: 'mobile' | 'home' | 'work' | 'other'
  primary: boolean
  smsConsent: boolean
  smsConsentDate: ISODateTimeString | null
}

export interface EmailContact {
  address: EmailAddress
  primary: boolean
  verified: boolean
}

export interface Address {
  line1: string
  line2: string | null
  city: string
  stateCode: StateCode
  postalCode: PostalCode
  countyFips: CountyFips | null
  primary: boolean
}

export type IncomePeriod = 'annual' | 'monthly' | 'weekly'
export type PersonStatus  = 'active' | 'merged' | 'deleted'

export interface Person {
  id: PersonId
  organizationId: OrganizationId
  primaryName: PersonName
  /** Former names, maiden names, aliases — all searched during conflict check */
  aliases: PersonName[]
  phones: Phone[]
  emails: EmailContact[]
  addresses: Address[]
  dateOfBirth: ISODateString | null
  /** BCP 47 language tag */
  language: string | null
  householdSize: number | null
  /** In cents */
  annualIncome: Cents | null
  incomePeriod: IncomePeriod | null
  status: PersonStatus
  /** Set when status === 'merged' */
  mergedIntoId: PersonId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreatePersonInput {
  primaryName: PersonName
  aliases?: PersonName[]
  phones?: Phone[]
  emails?: EmailContact[]
  addresses?: Address[]
  dateOfBirth?: ISODateString
  language?: string
  householdSize?: number
  annualIncome?: Cents
  incomePeriod?: IncomePeriod
}
