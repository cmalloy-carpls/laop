import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { persons } from "./persons.js";
import { problems } from "./problems.js";

export const matterStatusEnum = pgEnum("matter_status", [
  "open",
  "closed",
  "referred-out",
  "duplicate",
]);

export const matters = pgTable("matters", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  person_id: text("person_id")
    .references(() => persons.id)
    .notNull(),
  problem_id: text("problem_id").references(() => problems.id),
  county_fips: text("county_fips"),
  state_code: text("state_code"),
  status: matterStatusEnum("status").notNull(),
  opened_at: timestamp("opened_at", { withTimezone: true }).notNull(),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  duplicate_of_id: text("duplicate_of_id"),
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
