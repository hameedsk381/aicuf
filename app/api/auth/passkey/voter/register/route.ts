import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

const voterChallengeStore: Record<string, string> = {}

function getRpID(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return new URL(siteUrl).hostname
}

function getExpectedOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
          residentKey: 'preferred',
          userVerification: 'required',
          authenticatorAttachment: 'platform',
        },
      })
      voterChallengeStore[voterId] = options.challenge
      return NextResponse.json(options)
    }

    if (step === 'verify' && attestationResponse) {
      const expectedChallenge = voterChallengeStore[voterId]
      if (!expectedChallenge) {
        return NextResponse.json({ error: 'No challenge found' }, { status: 400 })
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

      await db.insert(schema.voterPasskeyCredentials).values({
        voterId: voter.id,
        credentialId: Buffer.from(credential.id).toString('base64'),
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
      })

      delete voterChallengeStore[voterId]
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Voter passkey registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
