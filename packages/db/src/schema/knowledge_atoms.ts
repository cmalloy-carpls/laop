import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";

export const atomTypeEnum = pgEnum("atom_type", [
  "topic",
  "rule",
  "risk",
  "decision-gate",
  "action-step",
  "service-route",
]);

// vector(1536) custom column type for pgvector — dimension matches OpenAI/Anthropic embedding size
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .slice(1, -1)
      .split(",")
      .map((n) => parseFloat(n));
  },
});

export const knowledge_atoms = pgTable("knowledge_atoms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // null = platform-level atom visible to all tenants
  organization_id: text("organization_id"),
  type: atomTypeEnum("type").notNull(),
  label: text("label").notNull(),
  body: text("body").notNull(),
  problem_ids: jsonb("problem_ids").$type<string[]>(),
  parent_ids: jsonb("parent_ids").$type<string[]>(),
  child_ids: jsonb("child_ids").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  embedding: vector("embedding"),
  embedding_version: text("embedding_version"),
  is_published: boolean("is_published").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Platform atoms (organization_id IS NULL) are visible to all tenants
export function setupRLS(tableName: string): string[] {
  return [
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE ${tableName} FORCE ROW LEVEL SECURITY`,
    `CREATE POLICY tenant_isolation ON ${tableName} USING (organization_id IS NULL OR organization_id = current_setting('app.current_org_id', true))`,
  ];
}
