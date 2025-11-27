import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, passkeyCredentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { redis } from '@/lib/redis';

// Helper to convert base64 to base64url
function base64ToBase64url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aptsaicuf.com';
    try {
        return new URL(siteUrl).hostname;
    } catch (e) {
        return 'aptsaicuf.com';
    }
}

// Get expected origin
function getExpectedOrigin(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://aptsaicuf.com';
}

export async function POST(req: Request) {
    try {
        const { email, step, assertionResponse } = await req.json();

        // Step 1: generate authentication options
        if (step === 'options') {
            const user = await db.query.registrations.findFirst({ where: eq(registrations.emailId, email) });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            const credentials = await db.select().from(passkeyCredentials).where(eq(passkeyCredentials.userId, user.id));

            console.log('Found credentials for user:', {
                email,
                userId: user.id,
                credentialCount: credentials.length,
                credentialIds: credentials.map(c => c.credentialId.substring(0, 20) + '...')
            });

            if (credentials.length === 0) {
                return NextResponse.json({ error: 'No passkeys registered for this user' }, { status: 404 });
            }

            // Convert base64 credential IDs from DB to base64url format for the browser
            const allowCredentials = credentials.map(cred => {
                // SimpleWebAuthn expects base64url string format
                const credentialIdBase64url = base64ToBase64url(cred.credentialId);
                return {
                    id: credentialIdBase64url,
                    type: 'public-key' as const,
                };
            });

            const options = await generateAuthenticationOptions({
                rpID: getRpID(),
                userVerification: 'preferred',
                timeout: 60000,
                allowCredentials,
            });

            await redis.set(`member_login_challenge:${email}`, options.challenge, 'EX', 60);

            return NextResponse.json(options);
        }

        // Step 2: verify assertion response
        if (step === 'verify' && assertionResponse) {
            const expectedChallenge = await redis.get(`member_login_challenge:${email}`);
            if (!expectedChallenge) {
                return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 });
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
                    publicKey: new Uint8Array(Buffer.from(storedCred[0].publicKey, 'base64')),
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

            await redis.del(`member_login_challenge:${email}`);

            return response;
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Passkey login error:', error);
        return NextResponse.json({
            error: 'Login failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
