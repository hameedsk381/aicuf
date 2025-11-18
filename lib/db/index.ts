import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

// Singleton pattern for database connection
let pgInstance: ReturnType<typeof postgres> | null = null

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in .env file")
  }

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
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDrizzleInstance() {
  if (!_db) {
    const pg = getDatabase()
    _db = drizzle(pg, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    const instance = getDrizzleInstance()
    return (instance as any)[prop]
  }
})

export { schema }
