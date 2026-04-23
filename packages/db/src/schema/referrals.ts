import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { engagements } from "./engagements";
import { users } from "./users";

export const referralStatusEnum = pgEnum("referral_status", [
  "pending",
  "accepted",
  "declined",
  "closed",
  "expired",
]);

export const referrals = pgTable("referrals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  source_organization_id: text("source_organization_id")
    .references(() => organizations.id)
    .notNull(),
  source_engagement_id: text("source_engagement_id")
    .references(() => engagements.id)
    .notNull(),
  destination_organization_id: text("destination_organization_id")
    .references(() => organizations.id)
    .notNull(),
  destination_engagement_id: text("destination_engagement_id").references(
    () => engagements.id,
  ),
  status: referralStatusEnum("status").notNull(),
  referral_note: text("referral_note"),
  outcome_note: text("outcome_note"),
  documents_transferred: boolean("documents_transferred")
    .notNull()
    .default(false),
  sent_at: timestamp("sent_at", { withTimezone: true }).notNull(),
  responded_at: timestamp("responded_at", { withTimezone: true }),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  sent_by_user_id: text("sent_by_user_id")
    .references(() => users.id)
    .notNull(),
  responded_by_user_id: text("responded_by_user_id").references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// RLS policy uses OR — referrals are visible to both the sending and receiving org
export function setupRLS(tableName: string): string[] {
  return [
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY`,
    `CREATE POLICY tenant_isolation ON ${tableName} USING (source_organization_id = current_setting('app.current_org_id', true) OR destination_organization_id = current_setting('app.current_org_id', true))`,
  ];
}
