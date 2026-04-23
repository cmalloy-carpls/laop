// Table exports — setupRLS is intentionally excluded (migration-only helper)
export { organizations, orgStatusEnum } from "./organizations.js";
export { users } from "./users.js";
export { persons } from "./persons.js";
export { problems } from "./problems.js";
export { matters } from "./matters.js";
export { funders } from "./funders.js";
export { programs } from "./programs.js";
export { engagements, serviceTypeEnum, engagementStatusEnum, closureReasonEnum, outcomeEnum } from "./engagements.js";
export { parties } from "./parties.js";
export { conflicts, conflictTierEnum, matchTypeEnum, conflictStatusEnum } from "./conflicts.js";
export { referrals } from "./referrals.js";
export { eligibility_checks } from "./eligibility_checks.js";
export { knowledge_atoms, atomTypeEnum } from "./knowledge_atoms.js";
export { documents, docStatusEnum, docSourceEnum } from "./documents.js";
export { audit_events } from "./audit_events.js";

import { organizations } from "./organizations.js";
import { users } from "./users.js";
import { persons } from "./persons.js";
import { problems } from "./problems.js";
import { matters } from "./matters.js";
import { funders } from "./funders.js";
import { programs } from "./programs.js";
import { engagements } from "./engagements.js";
import { parties } from "./parties.js";
import { conflicts } from "./conflicts.js";
import { referrals } from "./referrals.js";
import { eligibility_checks } from "./eligibility_checks.js";
import { knowledge_atoms } from "./knowledge_atoms.js";
import { documents } from "./documents.js";
import { audit_events } from "./audit_events.js";

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
