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
    const selections = Array.isArray(body.selections) ? body.selections : []

    if (!voterId || selections.length === 0) {
      return NextResponse.json({ success: false, message: 'voterId and selections are required' }, { status: 400 })
    }

    if (voterId !== authVoterId) {
      return NextResponse.json({ success: false, message: 'Voter ID mismatch' }, { status: 403 })
    }

    const voter = await db.query.voters.findFirst({ where: eq(schema.voters.id, authId) })
    if (!voter || voter.status !== 'approved') {
      return NextResponse.json({ success: false, message: 'Voter not approved' }, { status: 403 })
    }

    const existing = await db.select().from(votesTable).where(eq(votesTable.voterId, authId))
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'You have already submitted your ballot' }, { status: 409 })
    }

    const approved = await db.select().from(schema.nominations).where(eq(schema.nominations.status, 'approved'))
    const byId: Record<number, { contestingFor: string }> = {}
    for (const n of approved as any[]) {
      byId[n.id] = { contestingFor: n.contestingFor }
    }

    const positionsSeen = new Set<string>()
    for (const sel of selections) {
      const pos = sanitizeInput(sel.position || '')
      const nomId = parseInt(sel.nominationId)
      if (!pos || !nomId) {
        return NextResponse.json({ success: false, message: 'Invalid selection payload' }, { status: 400 })
      }
      if (positionsSeen.has(pos)) {
        return NextResponse.json({ success: false, message: 'Duplicate position in selections' }, { status: 400 })
      }
      positionsSeen.add(pos)
      const nom = byId[nomId]
      if (!nom || nom.contestingFor !== pos) {
        return NextResponse.json({ success: false, message: 'Invalid nomination for position' }, { status: 400 })
      }
    }

    const values = selections.map((sel: any) => ({
      voterId: authId,
      position: sanitizeInput(sel.position),
      nominationId: parseInt(sel.nominationId),
      createdAt: new Date(),
    }))

    if (values.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid selections to record' }, { status: 400 })
    }

    await db.insert(votesTable).values(values as any)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to cast vote', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
const votesTable: any = (schema as any).votes
