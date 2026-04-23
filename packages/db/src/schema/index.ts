// Table exports — setupRLS is intentionally excluded (migration-only helper)
export { organizations, orgStatusEnum } from "./organizations";
export { users } from "./users";
export { persons } from "./persons";
export { problems } from "./problems";
export { matters } from "./matters";
export { funders } from "./funders";
export { programs } from "./programs";
export { engagements, serviceTypeEnum, engagementStatusEnum, closureReasonEnum, outcomeEnum } from "./engagements";
export { parties } from "./parties";
export { conflicts, conflictTierEnum, matchTypeEnum, conflictStatusEnum } from "./conflicts";
export { referrals } from "./referrals";
export { eligibility_checks } from "./eligibility_checks";
export { knowledge_atoms, atomTypeEnum } from "./knowledge_atoms";
export { documents, docStatusEnum, docSourceEnum } from "./documents";
export { audit_events } from "./audit_events";

import { organizations } from "./organizations";
import { users } from "./users";
import { persons } from "./persons";
import { problems } from "./problems";
import { matters } from "./matters";
import { funders } from "./funders";
import { programs } from "./programs";
import { engagements } from "./engagements";
import { parties } from "./parties";
import { conflicts } from "./conflicts";
import { referrals } from "./referrals";
import { eligibility_checks } from "./eligibility_checks";
import { knowledge_atoms } from "./knowledge_atoms";
import { documents } from "./documents";
import { audit_events } from "./audit_events";

export const schema = {
  organizations,
  users,
  persons,
  problems,
  matters,
  funders,
  programs,
  engagements,
  parties,
  conflicts,
  referrals,
  eligibility_checks,
  knowledge_atoms,
  documents,
  audit_events,
};
