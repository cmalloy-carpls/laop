import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import WebSocket from "ws";

import * as schema from "./schema/index.js";

// WebSocket required for interactive transactions (withTenant, withPlatform)
neonConfig.webSocketConstructor = WebSocket;

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set — cannot initialize database client");
}

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export const db = drizzle(pool, { schema });

export async function withTenant<T>(
  orgId: string,
  userId: string | null,
  fn: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_org_id', ${orgId as string}, true)`,
    );
    await tx.execute(
      sql`SELECT set_config('app.current_user_id', ${userId ? (userId as string) : ""}, true)`,
    );
    return fn(tx as unknown as typeof db);
  });
}

export async function withPlatform<T>(
  fn: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction((tx) => fn(tx as unknown as typeof db));
}
