import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
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
    const { voterId, step, attestationResponse } = await req.json()

    if (step === 'options') {
      const voter = await db.query.voters.findFirst({ where: eq(schema.voters.voterId, voterId) })
      if (!voter) {
        return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
      }
      const options = await generateRegistrationOptions({
        rpName: 'APTSAICUF',
        rpID: getRpID(),
        userID: new Uint8Array(Buffer.from(voter.id.toString())),
        userName: voter.voterId,
        timeout: 60000,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
          authenticatorAttachment: 'platform',
        },
      })

      await setChallenge(`voter_register_challenge:${voterId}`, options.challenge, 60)

      return NextResponse.json(options)
    }

    if (step === 'verify' && attestationResponse) {
      const expectedChallenge = await getChallenge(`voter_register_challenge:${voterId}`)
      if (!expectedChallenge) {
        return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 })
      }

      const verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge,
        expectedOrigin: getExpectedOrigin(),
        expectedRPID: getRpID(),
      })

      if (!verification.verified) {
        return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 })
      }

      const { credential } = verification.registrationInfo
      const voter = await db.query.voters.findFirst({ where: eq(schema.voters.voterId, voterId) })
      if (!voter) {
        return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
      }

      const credentialData = {
        voterId: voter.id,
        credentialId: Buffer.from(credential.id).toString('base64'),
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
      }

      console.log('Storing voter passkey credential:', {
        voterId: voterId,
        voterDbId: voter.id,
        credentialIdLength: credentialData.credentialId.length,
        credentialIdPreview: credentialData.credentialId.substring(0, 20) + '...',
        rpID: getRpID(),
        origin: getExpectedOrigin()
      })

      await db.insert(schema.voterPasskeyCredentials).values(credentialData)

      await deleteChallenge(`voter_register_challenge:${voterId}`)
      const res = NextResponse.json({ success: true })
      res.cookies.set('voter_register_challenge', '', { maxAge: 0, path: '/' })
      return res
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Voter passkey registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
