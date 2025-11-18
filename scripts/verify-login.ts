import { db } from "@/lib/db"
import { registrations } from "@/lib/db/schema"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
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

async function testLogin() {
    const email = "test@example.com"
    const password = "password123"
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("1. Cleaning up old test user...")
    try {
        await db.delete(registrations).where(eq(registrations.emailId, email))
    } catch (e) {
        console.log("Cleanup failed (might not exist):", e)
    }

    console.log("2. Creating test user...")
    await db.insert(registrations).values({
        registrationId: "REG-TEST-001",
        applicationType: "New",
        name: "Test User",
        gender: "Other",
        registrationNo: "12345",
        course: "Test Course",
        age: "20",
        mobileNo: "1234567890",
        whatsappNo: "1234567890",
        emailId: email,
        religion: "Other",
        address: "Test Address",
        password: hashedPassword,
        role: "member"
    })

    console.log("3. Verifying user created...")
    // @ts-ignore - db type inference issue
    const user = await db.query.registrations.findFirst({
        where: eq(registrations.emailId, email),
    })

    if (user && user.password) {
        console.log("✅ User created with password")
        const isValid = await bcrypt.compare(password, user.password)
        if (isValid) {
            console.log("✅ Password verification successful")
        } else {
            console.error("❌ Password verification failed")
        }
    } else {
        console.error("❌ User creation failed")
    }

    process.exit(0)
}

testLogin().catch((err) => {
    console.error(err)
    process.exit(1)
})
