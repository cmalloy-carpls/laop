import {
  pgTable,
  text,
  real,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { engagements } from "./engagements.js";
import { parties } from "./parties.js";
import { users } from "./users.js";

export const conflictTierEnum = pgEnum("conflict_tier", [
  "red",
  "orange",
  "yellow",
  "green",
]);

export const matchTypeEnum = pgEnum("match_type", [
  "exact-name",
  "alias-name",
  "fuzzy-name",
  "dob-proximity",
  "address",
  "compound",
]);

export const conflictStatusEnum = pgEnum("conflict_status", [
  "pending-review",
  "confirmed",
  "cleared",
  "overridden",
]);

export const conflicts = pgTable("conflicts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  engagement_id: text("engagement_id")
    .references(() => engagements.id)
    .notNull(),
  source_party_id: text("source_party_id")
    .references(() => parties.id)
    .notNull(),
  matched_party_id: text("matched_party_id")
    .references(() => parties.id)
    .notNull(),
  tier: conflictTierEnum("tier").notNull(),
  match_type: matchTypeEnum("match_type").notNull(),
  match_score: real("match_score").notNull(),
  status: conflictStatusEnum("status").notNull(),
  reviewed_by_user_id: text("reviewed_by_user_id").references(() => users.id),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  resolution: text("resolution"),
  is_cross_org: boolean("is_cross_org").notNull().default(false),
  source_organization_id: text("source_organization_id").references(
    () => organizations.id,
  ),
  detected_at: timestamp("detected_at", { withTimezone: true }).notNull(),
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
