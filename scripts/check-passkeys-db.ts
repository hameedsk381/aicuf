import { config } from 'dotenv';
config();

import { db } from '../lib/db/index.js';
import { passkeyCredentials, registrations } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function checkPasskeys() {
    try {
        console.log('Checking passkey credentials in database...\n');

        const allCreds = await db.select().from(passkeyCredentials);

        if (allCreds.length === 0) {
            console.log('❌ No passkey credentials found in database');
            console.log('\nThis means the passkey registration did not save to the database.');
            console.log('Check the browser console and server logs for errors during registration.');
        } else {
            console.log(`✅ Found ${allCreds.length} passkey credential(s):\n`);

            for (const cred of allCreds) {
                const user = await db.select().from(registrations).where(eq(registrations.id, cred.userId));
                console.log(`Credential ID: ${cred.id}`);
                console.log(`User ID: ${cred.userId}`);
                console.log(`Email: ${user[0]?.emailId || 'Unknown'}`);
                console.log(`Credential ID (base64): ${cred.credentialId.substring(0, 50)}...`);
                console.log(`Counter: ${cred.counter}`);
                console.log(`Created: ${cred.createdAt}`);
                console.log('---');
            }
        }

    } catch (error) {
        console.error('Error checking passkeys:', error);
    }

    process.exit(0);
}

checkPasskeys();
