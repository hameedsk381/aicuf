import { NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const votes = await db.select().from(schema.votes)
    const nominations = await db.select().from(schema.nominations).where(eq(schema.nominations.status, 'approved'))
    const nomById = new Map(nominations.map(n => [n.id, n]))

    const results: Record<string, { candidateId: number; name: string; unitName: string; count: number }[]> = {}

    for (const v of votes as Array<{ position: string; nominationId: number }>) {
      const position = v.position
      const nom = nomById.get(v.nominationId)
      if (!position || !nom) continue
      results[position] ||= []
      const arr = results[position]
      const existing = arr.find(x => x.candidateId === v.nominationId)
      if (existing) existing.count += 1
      else arr.push({ candidateId: v.nominationId, name: nom.name, unitName: nom.unitName, count: 1 })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to load results', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
