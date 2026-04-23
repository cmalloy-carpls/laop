import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import type { OperatingProfile } from "../types";

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "suspended",
  "archived",
]);

export const organizations = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  status: orgStatusEnum("status").notNull(),
  profiles: jsonb("profiles").$type<OperatingProfile[]>(),
  timezone: text("timezone"),
  primary_jurisdiction: text("primary_jurisdiction"),
  settings: jsonb("settings").$type<unknown>(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
