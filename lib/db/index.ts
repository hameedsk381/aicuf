import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env file")
}

// Singleton pattern for database connection
let pgInstance: ReturnType<typeof postgres> | null = null

function getDatabase() {
  if (!pgInstance) {
    pgInstance = postgres(process.env.DATABASE_URL!, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }
  return pgInstance
}

// Lazy database initialization - only create when first accessed
let _db: ReturnType<typeof drizzle> | null = null

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      const pg = getDatabase()
      _db = drizzle(pg, { schema })
    }
    return (_db as any)[prop]
  }
})

export { schema }
