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

    const nominations = await db.select().from(schema.nominations)
      .orderBy(desc(schema.nominations.createdAt))

    return NextResponse.json({
      success: true,
      data: nominations,
      count: nominations.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch nominations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.replace("Bearer ", "")

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Nomination ID is required" },
        { status: 400 }
      )
    }

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (pending, approved, rejected)" },
        { status: 400 }
      )
    }

    await db.update(schema.nominations)
      .set({ status })
      .where(eq(schema.nominations.id, id))

    return NextResponse.json({
      success: true,
      message: "Nomination status updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update nomination",
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
        { success: false, message: "Nomination ID is required" },
        { status: 400 }
      )
    }

    await db.delete(schema.nominations)
      .where(eq(schema.nominations.id, parseInt(id)))

    return NextResponse.json({
      success: true,
      message: "Nomination deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete nomination",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
