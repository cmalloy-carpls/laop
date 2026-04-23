import {
  pgTable,
  text,
  boolean,
  integer,
  bigint,
  real,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { engagements } from "./engagements.js";
import { programs } from "./programs.js";
import { users } from "./users.js";
import type { EligibilityReason } from "../types.js";

export const eligibilityMethodEnum = pgEnum("eligibility_method", [
  "automated",
  "staff-override",
]);

export const eligibility_checks = pgTable("eligibility_checks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  engagement_id: text("engagement_id")
    .references(() => engagements.id)
    .notNull(),
  program_id: text("program_id")
    .references(() => programs.id)
    .notNull(),
  eligible: boolean("eligible").notNull(),
  reasons: jsonb("reasons").$type<EligibilityReason[]>(),
  income_at_check: bigint("income_at_check", { mode: "bigint" }),
  household_size_at_check: integer("household_size_at_check"),
  poverty_pct_at_check: real("poverty_pct_at_check"),
  checked_at: timestamp("checked_at", { withTimezone: true }).notNull(),
  checked_by_user_id: text("checked_by_user_id").references(() => users.id),
  method: eligibilityMethodEnum("method").notNull(),
  // Immutable record — no updated_at
  created_at: timestamp("created_at", { withTimezone: true })
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
