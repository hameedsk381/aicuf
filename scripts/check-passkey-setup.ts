import { config } from "dotenv";
import { db } from "../lib/db";
import { registrations } from "../lib/db/schema";
import { eq } from "drizzle-orm";

config();

async function createPasskeyRegistrationPage() {
    console.log("Checking for test user...");

    const testUser = await db.query.registrations.findFirst({
        where: eq(registrations.emailId, "test@example.com"),
    });

    if (!testUser) {
        console.log("❌ Test user not found. Please create a user first using verify-login.ts");
        process.exit(1);
    }

    console.log(`✅ Test user found: ${testUser.emailId} (ID: ${testUser.id})`);
    console.log("\nTo register a passkey:");
    console.log("1. Start the dev server: npm run dev");
    console.log("2. Navigate to: http://localhost:3000/member/passkey/register");
    console.log("3. Or try passkey login from: http://localhost:3000/member/login");
    console.log("\nNote: You'll need to create the registration page first!");

    process.exit(0);
}

createPasskeyRegistrationPage();
