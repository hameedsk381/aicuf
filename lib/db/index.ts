import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema"
import { join } from "path"
import { mkdirSync, existsSync } from "fs"

const dataDir = join(process.cwd(), "data")
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), "data", "aicuf.db")

// Ensure database file exists
const sqlite = new Database(dbPath, { create: true })

// Enable WAL mode for better concurrency
sqlite.exec("PRAGMA journal_mode = WAL")

export const db = drizzle(sqlite, { schema })
export { schema }
