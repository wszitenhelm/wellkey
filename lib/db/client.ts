import postgres from "postgres";
import { getEnv } from "@/lib/config/env";

let cachedDb: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = postgres(getEnv().DATABASE_URL, {
    max: 1,
    prepare: false
  });

  return cachedDb;
}
