import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "view",
  "export",
  "login",
  "logout",
  "override",
]);

export const audit_events = pgTable("audit_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // nullable — platform-level events have no org
  organization_id: text("organization_id"),
  // intentionally not a FK — user may be deleted but audit trail must persist
  user_id: text("user_id"),
  action: auditActionEnum("action").notNull(),
  resource_type: text("resource_type").notNull(),
  resource_id: text("resource_id").notNull(),
  diff: jsonb("diff"),
  ip_address: text("ip_address"),
  occurred_at: timestamp("occurred_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Platform events (organization_id IS NULL) visible to all tenants for their own audit trail
export function setupRLS(tableName: string): string[] {
  return [
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY`,
    `CREATE POLICY tenant_isolation ON ${tableName} USING (organization_id IS NULL OR organization_id = current_setting('app.current_org_id', true))`,
  ];
}
