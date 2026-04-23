import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";

export const problems = pgTable("problems", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lsc_code: text("lsc_code"),
  lsc_subcode: text("lsc_subcode"),
  label: text("label").notNull(),
  description: text("description"),
  parent_id: text("parent_id"),
  is_leaf: boolean("is_leaf").notNull().default(true),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
});
