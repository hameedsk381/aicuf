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

    const registrations = await db.select().from(schema.registrations)
      .orderBy(desc(schema.registrations.createdAt))

    return NextResponse.json({
      success: true,
      data: registrations,
      count: registrations.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch registrations",
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
        { success: false, message: "Registration ID is required" },
        { status: 400 }
      )
    }

    await db.delete(schema.registrations)
      .where(eq(schema.registrations.id, parseInt(id)))

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete registration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
