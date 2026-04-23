import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { matters } from "./matters.js";
import { programs } from "./programs.js";
import { users } from "./users.js";

export const serviceTypeEnum = pgEnum("service_type", [
  "brief-advice",
  "limited-action",
  "extended-service",
  "full-representation",
  "information",
  "referral-only",
]);

export const engagementStatusEnum = pgEnum("engagement_status", [
  "intake",
  "conflict-check",
  "eligible",
  "ineligible",
  "open",
  "closed",
  "referred",
]);

export const closureReasonEnum = pgEnum("closure_reason", [
  "service-rendered",
  "referred-out",
  "client-withdrew",
  "ineligible",
  "conflict",
  "no-show",
  "other",
]);

export const outcomeEnum = pgEnum("outcome", [
  "favorable",
  "unfavorable",
  "mixed",
  "incomplete",
  "pending",
]);

export const engagements = pgTable("engagements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  matter_id: text("matter_id")
    .references(() => matters.id)
    .notNull(),
  program_id: text("program_id").references(() => programs.id),
  service_type: serviceTypeEnum("service_type").notNull(),
  status: engagementStatusEnum("status").notNull(),
  assigned_user_id: text("assigned_user_id").references(() => users.id),
  opened_at: timestamp("opened_at", { withTimezone: true }).notNull(),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  closure_reason: closureReasonEnum("closure_reason"),
  outcome: outcomeEnum("outcome"),
  closure_note: text("closure_note"),
  lsc_problem_code: text("lsc_problem_code"),
  lsc_subproblem_code: text("lsc_subproblem_code"),
  external_id: text("external_id"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export function setupRLS(tableName: string): string[] {
  return [
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY`,
    `CREATE POLICY tenant_isolation ON ${tableName} USING (organization_id = current_setting('app.current_org_id', true))`,
  ];
}
