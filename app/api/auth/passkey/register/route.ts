import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, passkeyCredentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

// In-memory store for challenges (for demo purposes only)
const challengeStore: Record<string, string> = {};

// Get rpID from environment - use hostname from NEXT_PUBLIC_SITE_URL
function getRpID(): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return new URL(siteUrl).hostname;
}

// Get expected origin
function getExpectedOrigin(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function POST(req: Request) {
    try {
        const { email, step, attestationResponse } = await req.json();

        // Step 1: generate registration options
        if (step === 'options') {
            const user = await db.query.registrations.findFirst({ where: eq(registrations.emailId, email) });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            const options = await generateRegistrationOptions({
                rpName: 'AICUF',
                rpID: getRpID(),
                userID: new Uint8Array(Buffer.from(user.id.toString())),
                userName: user.emailId,
                timeout: 60000,
                attestationType: 'none',
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'required',
                    authenticatorAttachment: 'platform',
                },
            });
            challengeStore[email] = options.challenge;
            return NextResponse.json(options);
        }

        // Step 2: verify registration response and store credential
        if (step === 'verify' && attestationResponse) {
            const expectedChallenge = challengeStore[email];
            if (!expectedChallenge) {
                return NextResponse.json({ error: 'No challenge found' }, { status: 400 });
            }

            const verification = await verifyRegistrationResponse({
                response: attestationResponse,
                expectedChallenge,
                expectedOrigin: getExpectedOrigin(),
                expectedRPID: getRpID(),
            });

            if (!verification.verified) {
                return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
            }

            const { credential } = verification.registrationInfo;
            const user = await db.query.registrations.findFirst({ where: eq(registrations.emailId, email) });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const credentialData = {
                userId: user.id,
                credentialId: Buffer.from(credential.id).toString('base64'),
                publicKey: Buffer.from(credential.publicKey).toString('base64'),
                counter: credential.counter,
            };

            console.log('Storing passkey credential:', {
                userId: user.id,
                credentialIdLength: credentialData.credentialId.length,
                email: user.emailId
            });

            await db.insert(passkeyCredentials).values(credentialData);

            delete challengeStore[email];
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Passkey registration error:', error);
        return NextResponse.json({
            error: 'Registration failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

