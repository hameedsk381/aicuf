import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { sanitizeInput } from "@/lib/sanitize"

export async function POST(req: NextRequest) {
  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key')
    const { jwtVerify } = await import('jose')
    const token = req.cookies.get('voterToken')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const authVoterId = payload.voterId as string
    const authId = payload.id as number

    const body = await req.json()
    const voterId = sanitizeInput(body.voterId || '')
    const position = sanitizeInput(body.position || '')
    const nominationId = parseInt(body.nominationId)

    if (!voterId || !position || !nominationId) {
      return NextResponse.json({ success: false, message: 'voterId, position and nominationId are required' }, { status: 400 })
    }

    if (voterId !== authVoterId) {
      return NextResponse.json({ success: false, message: 'Voter ID mismatch' }, { status: 403 })
    }

    const voter = await db.query.voters.findFirst({ where: eq(schema.voters.id, authId) })
    if (!voter || voter.status !== 'approved') {
      return NextResponse.json({ success: false, message: 'Voter not approved' }, { status: 403 })
    }

    const existing = await db.select().from(votesTable).where(eq(votesTable.voterId, authId))
    // Prevent duplicate vote per position
    if (existing.some(v => (v as any).position === position)) {
      return NextResponse.json({ success: false, message: 'You have already voted for this position' }, { status: 409 })
    }

    await db.insert(votesTable).values({ voterId: authId, position, nominationId, createdAt: new Date() })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to cast vote', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
const votesTable: any = (schema as any).votes
