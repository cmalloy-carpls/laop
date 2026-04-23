import { pgTable, text, date, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { matters } from "./matters.js";
import { persons } from "./persons.js";
import type { PersonName } from "../types.js";

export const partyRoleEnum = pgEnum("party_role", [
  "client",
  "opposing",
  "witness",
  "co-counsel",
  "other",
]);

export const partyStatusEnum = pgEnum("party_status", [
  "active",
  "superseded",
  "removed",
]);

export const parties = pgTable("parties", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  matter_id: text("matter_id")
    .references(() => matters.id)
    .notNull(),
  person_id: text("person_id").references(() => persons.id),
  role: partyRoleEnum("role").notNull(),
  name_snapshot: jsonb("name_snapshot").$type<PersonName>(),
  dob_snapshot: date("dob_snapshot"),
  status: partyStatusEnum("status").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (t) => [
  // Conflict check queries filter by org + status first, then search name_snapshot
  index("parties_org_status_idx").on(t.organization_id, t.status),
  index("parties_dob_idx").on(t.dob_snapshot),
  index("parties_name_snapshot_gin_idx").using("gin", t.name_snapshot),
]);

export function setupRLS(tableName: string): string[] {
  return [
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY`,
    `CREATE POLICY tenant_isolation ON ${tableName} USING (organization_id = current_setting('app.current_org_id', true))`,
  ];
}
