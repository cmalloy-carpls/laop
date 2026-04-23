import type {
  MatterId, OrganizationId, PersonId, ProblemId,
  ISODateTimeString, CountyFips, StateCode,
} from '../shared/branded.js'

export type MatterStatus = 'open' | 'closed' | 'referred-out' | 'duplicate'

export interface Matter {
  id: MatterId
  organizationId: OrganizationId
  personId: PersonId
  problemId: ProblemId
  countyFips: CountyFips | null
  stateCode: StateCode | null
  status: MatterStatus
  openedAt: ISODateTimeString
  closedAt: ISODateTimeString | null
  /** Set when status === 'duplicate' */
  duplicateOfId: MatterId | null
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface CreateMatterInput {
  personId: PersonId
  problemId: ProblemId
  countyFips?: CountyFips
  stateCode?: StateCode
}
