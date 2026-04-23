import {
  pgTable,
  text,
  integer,
  bigint,
  date,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import type { PersonName, Phone, EmailContact, Address } from "../types";

export const incomePeriodEnum = pgEnum("income_period", [
  "annual",
  "monthly",
  "weekly",
]);

export const personStatusEnum = pgEnum("person_status", [
  "active",
  "merged",
  "deleted",
]);

export const persons = pgTable("persons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organization_id: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  primary_name: jsonb("primary_name").$type<PersonName>(),
  aliases: jsonb("aliases").$type<PersonName[]>(),
  phones: jsonb("phones").$type<Phone[]>(),
  email_contacts: jsonb("email_contacts").$type<EmailContact[]>(),
  addresses: jsonb("addresses").$type<Address[]>(),
  date_of_birth: date("date_of_birth"),
  language: text("language"),
  household_size: integer("household_size"),
  annual_income: bigint("annual_income", { mode: "bigint" }),
  income_period: incomePeriodEnum("income_period"),
  status: personStatusEnum("status").notNull(),
  merged_into_id: text("merged_into_id"),
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
