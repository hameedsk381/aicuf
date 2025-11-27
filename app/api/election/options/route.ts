import { NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const approved = await db.select().from(schema.nominations).where(eq(schema.nominations.status, 'approved'))
    const grouped: Record<string, any[]> = {}
    for (const nom of approved) {
      const key = nom.contestingFor
      grouped[key] ||= []
      grouped[key].push({ id: nom.id, name: nom.name, unitName: nom.unitName })
    }
    const positions = Object.entries(grouped)
      .filter(([, list]) => list.length > 1)
      .map(([position, candidates]) => ({ position, candidates }))

    return NextResponse.json({ success: true, positions })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to load election options', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

