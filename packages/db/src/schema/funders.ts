import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const funderTypeEnum = pgEnum("funder_type", [
  "lsc",
  "iolta",
  "state-bar",
  "foundation",
  "government",
  "other",
]);

export const funders = pgTable("funders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  name: text("name").notNull(),
  type: funderTypeEnum("type").notNull(),
  reporting_period_start: timestamp("reporting_period_start", {
    withTimezone: true,
  }),
  reporting_period_end: timestamp("reporting_period_end", {
    withTimezone: true,
  }),
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
