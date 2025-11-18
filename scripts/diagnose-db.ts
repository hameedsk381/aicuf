import postgres from "postgres"
import fs from "fs"
import path from "path"

// Load .env manually
const envPath = path.resolve(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8")
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=")
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const url = process.env.DATABASE_URL
if (!url) {
    console.error("❌ DATABASE_URL is not defined in .env")
    process.exit(1)
}

// Mask password for display
const maskedUrl = url.replace(/:([^:@]+)@/, ":****@")
console.log(`Checking connection to: ${maskedUrl}`)

const sql = postgres(url, { max: 1 })

async function check() {
    try {
        const result = await sql`SELECT 1+1 as result`
        console.log("✅ Connection successful!")
        console.log("Result:", result)
    } catch (error) {
        console.error("❌ Connection failed:")
        console.error(error)
    } finally {
        await sql.end()
    }
}

check()
