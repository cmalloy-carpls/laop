import { pgTable, text, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { funders } from "./funders";

export const programs = pgTable("programs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  funder_id: text("funder_id").references(() => funders.id),
  name: text("name").notNull(),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  start_date: date("start_date"),
  end_date: date("end_date"),
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
