import { pgTable, text, bigint, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { matters } from "./matters";
import { engagements } from "./engagements";
import { users } from "./users";

export const docSourceEnum = pgEnum("doc_source", [
  "upload",
  "generated",
  "received",
]);

export const docStatusEnum = pgEnum("doc_status", [
  "pending",
  "ready",
  "signed",
  "failed",
  "deleted",
]);

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  matter_id: text("matter_id").references(() => matters.id),
  engagement_id: text("engagement_id").references(() => engagements.id),
  label: text("label").notNull(),
  mime_type: text("mime_type").notNull(),
  size_bytes: bigint("size_bytes", { mode: "bigint" }).notNull(),
  storage_key: text("storage_key").notNull(),
  source: docSourceEnum("source").notNull(),
  status: docStatusEnum("status").notNull(),
  template_id: text("template_id"),
  signature_envelope_id: text("signature_envelope_id"),
  uploaded_by_user_id: text("uploaded_by_user_id").references(() => users.id),
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
