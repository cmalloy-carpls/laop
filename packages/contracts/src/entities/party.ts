import type {
  PartyId, OrganizationId, MatterId, PersonId,
  ISODateString, ISODateTimeString,
} from '../shared/branded.js'
import type { PersonName } from './person.js'

export type PartyRole = 'client' | 'opposing' | 'witness' | 'co-counsel' | 'other'
export type PartyStatus = 'active' | 'superseded' | 'removed'

export interface Party {
  id: PartyId
  organizationId: OrganizationId
  matterId: MatterId
  /** Null when the party hasn't been matched to a Person record yet */
  personId: PersonId | null
  role: PartyRole
  /** Snapshot at time of capture — preserved for historical conflict audit */
  nameSnapshot: PersonName
  dobSnapshot: ISODateString | null
  status: PartyStatus
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreatePartyInput {
  matterId: MatterId
  personId?: PersonId
  role: PartyRole
  nameSnapshot: PersonName
  dobSnapshot?: ISODateString
}
