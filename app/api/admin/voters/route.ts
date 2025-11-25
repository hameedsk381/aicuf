import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const voters = await db.select().from(schema.voters).orderBy(desc(schema.voters.createdAt))
    return NextResponse.json({ success: true, data: voters, count: voters.length })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch voters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

