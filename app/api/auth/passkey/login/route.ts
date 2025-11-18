import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, passkeyCredentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

// In-memory store for login challenges (demo only)
const loginChallengeStore: Record<string, string> = {};

// Helper to convert base64url to base64
function base64urlToBase64(base64url: string): string {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }
    return base64;
}

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
    const { email, step, assertionResponse } = await req.json();

    // Step 1: generate authentication options
    if (step === 'options') {
        const user = await db.query.registrations.findFirst({ where: eq(registrations.emailId, email) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const credentials = await db.select().from(passkeyCredentials).where(eq(passkeyCredentials.userId, user.id));
        const allowCredentials = credentials.map(cred => ({
            id: cred.credentialId,
            type: 'public-key' as const,
        }));
        const options = await generateAuthenticationOptions({
            rpID: getRpID(),
            userVerification: 'preferred',
            timeout: 60000,
            allowCredentials,
        });
        loginChallengeStore[email] = options.challenge;
        return NextResponse.json(options);
    }

    // Step 2: verify assertion response
    if (step === 'verify' && assertionResponse) {
        const expectedChallenge = loginChallengeStore[email];
        if (!expectedChallenge) {
            return NextResponse.json({ error: 'No challenge found' }, { status: 400 });
        }

        const user = await db.query.registrations.findFirst({ where: eq(registrations.emailId, email) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Convert base64url credential ID from browser to base64 for DB lookup
        const credentialIdBase64 = base64urlToBase64(assertionResponse.id);
        const storedCred = await db.select().from(passkeyCredentials).where(eq(passkeyCredentials.credentialId, credentialIdBase64));

        if (storedCred.length === 0) {
            return NextResponse.json({ error: 'Credential not registered' }, { status: 404 });
        }

        const verification = await verifyAuthenticationResponse({
            response: assertionResponse,
            expectedChallenge,
            expectedOrigin: getExpectedOrigin(),
            expectedRPID: getRpID(),
            credential: {
                id: storedCred[0].credentialId,
                publicKey: Buffer.from(storedCred[0].publicKey, 'base64'),
                counter: storedCred[0].counter,
            },
        });

        if (!verification.verified) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
        }

        const { newCounter } = verification.authenticationInfo;
        await db.update(passkeyCredentials).set({ counter: newCounter }).where(eq(passkeyCredentials.id, storedCred[0].id));

        // Issue JWT (reuse same secret as password login)
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { SignJWT } = await import('jose');
        const token = await new SignJWT({
            id: storedCred[0].userId,
            email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);
        const response = NextResponse.json({ success: true });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });
        delete loginChallengeStore[email];
        return response;
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
