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

    const contacts = await db.select().from(schema.contacts)
      .orderBy(desc(schema.contacts.createdAt))

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contacts",
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
        { success: false, message: "Contact ID is required" },
        { status: 400 }
      )
    }

    if (!status || !["unread", "read"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (unread, read)" },
        { status: 400 }
      )
    }

    await db.update(schema.contacts)
      .set({ status })
      .where(eq(schema.contacts.id, id))

    return NextResponse.json({
      success: true,
      message: "Contact status updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact",
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
        { success: false, message: "Contact ID is required" },
        { status: 400 }
      )
    }

    await db.delete(schema.contacts)
      .where(eq(schema.contacts.id, parseInt(id)))

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete contact",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
