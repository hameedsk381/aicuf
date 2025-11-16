import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { db, schema } from "@/lib/db"
import { desc, eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.replace("Bearer ", "")

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const newsletters = await db.select().from(schema.newsletters)
      .orderBy(desc(schema.newsletters.subscribedAt))

    return NextResponse.json({
      success: true,
      data: newsletters,
      count: newsletters.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch newsletters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.replace("Bearer ", "")

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Newsletter ID is required" },
        { status: 400 }
      )
    }

    await db.delete(schema.newsletters)
      .where(eq(schema.newsletters.id, parseInt(id)))

    return NextResponse.json({
      success: true,
      message: "Newsletter subscriber deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete newsletter subscriber",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
