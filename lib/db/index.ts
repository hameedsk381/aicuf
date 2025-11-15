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

// Singleton pattern for database connection
let sqliteInstance: Database | null = null

function getDatabase() {
  if (!sqliteInstance) {
    sqliteInstance = new Database(dbPath, { create: true })
    
    // Enable WAL mode for better concurrency
    sqliteInstance.exec("PRAGMA journal_mode = WAL")
    
    // Initialize tables if they don't exist
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_id TEXT NOT NULL UNIQUE,
        application_type TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        registration_no TEXT NOT NULL,
        course TEXT NOT NULL,
        age TEXT NOT NULL,
        instagram_id TEXT,
        mobile_no TEXT NOT NULL,
        whatsapp_no TEXT NOT NULL,
        email_id TEXT NOT NULL,
        religion TEXT NOT NULL,
        address TEXT NOT NULL,
        skills TEXT,
        other_skills TEXT,
        event_experience TEXT,
        just_society_definition TEXT,
        communication_example TEXT,
        aicuf_vision TEXT,
        leadership_position TEXT,
        additional_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS nominations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        unit_name TEXT NOT NULL,
        contesting_for TEXT NOT NULL,
        education_qualification TEXT NOT NULL,
        noc_file_path TEXT NOT NULL,
        noc_file_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unread',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS newsletters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `)
  }
  return sqliteInstance
}

const sqlite = getDatabase()
export const db = drizzle(sqlite, { schema })
export { schema }
