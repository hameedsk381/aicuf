import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
// Using in-memory store for challenges (can be replaced with Redis in production)

// Fallback in-memory storage when Redis is unavailable
const memoryStore: Record<string, string> = {}

async function setChallenge(key: string, value: string, ttlSeconds: number): Promise<void> {
  memoryStore[key] = value
  setTimeout(() => delete memoryStore[key], ttlSeconds * 1000)
}

async function getChallenge(key: string): Promise<string | null> {
  return memoryStore[key] || null
}

async function deleteChallenge(key: string): Promise<void> {
  delete memoryStore[key]
}

function base64ToBase64url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  return base64
}

function getRpID(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aptsaicuf.com'
  try {
    return new URL(siteUrl).hostname
  } catch (e) {
    return 'aptsaicuf.com'
  }
}

function getExpectedOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://aptsaicuf.com'
}

export async function POST(req: Request) {
  try {
    const { voterId, step, assertionResponse } = await req.json()

    if (step === 'options') {
      const voter = await db.query.voters.findFirst({ where: eq(schema.voters.voterId, voterId) })
      if (!voter) return NextResponse.json({ error: 'Voter not found' }, { status: 404 })

      console.log('Looking up passkey credentials for voter:', { voterId, voterDbId: voter.id })

      const creds = await db.select().from(schema.voterPasskeyCredentials).where(eq(schema.voterPasskeyCredentials.voterId, voter.id))

      console.log('Found credentials:', {
        count: creds.length,
        credentialIds: creds.map(c => ({
          id: c.id,
          credentialIdPreview: c.credentialId.substring(0, 20) + '...',
          credentialIdLength: c.credentialId.length
        }))
      })

      if (creds.length === 0) {
        console.error('No passkeys found for voter:', voterId)
        return NextResponse.json({ error: 'No passkeys registered for this voter. Please register your passkey first.' }, { status: 404 })
      }

      console.log('Using discoverable credentials mode (no allowCredentials). rpID:', getRpID())
      const options = await generateAuthenticationOptions({ rpID: getRpID(), userVerification: 'required', timeout: 60000 })

      await setChallenge(`voter_login_challenge:${voterId}`, options.challenge, 300)

      const res = NextResponse.json(options)
      res.cookies.set('voter_login_challenge', options.challenge, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 300,
        path: '/',
      })
      return res
    }

    if (step === 'verify' && assertionResponse) {
      const cookieChallenge = (req as any).cookies?.get?.('voter_login_challenge')?.value
      const expected = cookieChallenge || await getChallenge(`voter_login_challenge:${voterId}`)
      if (!expected) return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 })

      const voter = await db.query.voters.findFirst({ where: eq(schema.voters.voterId, voterId) })
      if (!voter) return NextResponse.json({ error: 'Voter not found' }, { status: 404 })

      // First try base64url match against stored credentialId
      let stored = await db.select().from(schema.voterPasskeyCredentials).where(eq(schema.voterPasskeyCredentials.credentialId, assertionResponse.id))
      // Fallback: some older records may have stored base64 instead of base64url; try matching converted base64
      if (stored.length === 0) {
        const credIdBase64 = base64urlToBase64(assertionResponse.id)
        stored = await db.select().from(schema.voterPasskeyCredentials).where(eq(schema.voterPasskeyCredentials.credentialId, credIdBase64))
      }
      if (stored.length === 0) return NextResponse.json({ error: 'Credential not registered' }, { status: 404 })

      const verification = await verifyAuthenticationResponse({
        response: assertionResponse,
        expectedChallenge: expected,
        expectedOrigin: getExpectedOrigin(),
        expectedRPID: getRpID(),
        credential: {
          id: stored[0].credentialId,
          publicKey: new Uint8Array(Buffer.from(stored[0].publicKey, 'base64')),
          counter: stored[0].counter,
        },
      })

      if (!verification.verified) return NextResponse.json({ error: 'Authentication failed' }, { status: 400 })

      const { newCounter } = verification.authenticationInfo
      await db.update(schema.voterPasskeyCredentials).set({ counter: newCounter }).where(eq(schema.voterPasskeyCredentials.id, stored[0].id))

      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key')
      const { SignJWT } = await import('jose')
      const token = await new SignJWT({ id: voter.id, voterId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET)

      const response = NextResponse.json({ success: true })
      response.cookies.set('voterToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })

      await deleteChallenge(`voter_login_challenge:${voterId}`)
      response.cookies.set('voter_login_challenge', '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Voter passkey login error:', error)
    return NextResponse.json({ error: 'Login failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
