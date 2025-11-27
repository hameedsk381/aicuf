import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { desc, eq } from "drizzle-orm"

function generateVoterId() {
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `VOTER-${Date.now()}-${rand}`
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body.name || "").trim()
    const designation = (body.designation || "").trim()
    const unitName = (body.unitName || "").trim()
    const mobileNo = (body.mobileNo || "").trim()
    let voterId = (body.voterId || "").trim()

    if (!name || !designation || !unitName || !mobileNo) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    if (!/^[0-9]{10,15}$/.test(mobileNo)) {
      return NextResponse.json({ success: false, message: "Invalid mobile number" }, { status: 400 })
    }

    if (!voterId) voterId = generateVoterId()

    await db.insert(schema.voters).values({
      voterId,
      name,
      designation,
      unitName,
      mobileNo,
      status: 'pending',
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, voterId })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create voter", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id
    if (!id) {
      return NextResponse.json({ success: false, message: "Voter id is required" }, { status: 400 })
    }

    const updateFields: any = {}
    if (body.name) updateFields.name = body.name.trim()
    if (body.designation) updateFields.designation = body.designation.trim()
    if (body.unitName) updateFields.unitName = body.unitName.trim()
    if (body.mobileNo) {
      const mobileNo = body.mobileNo.trim()
      if (!/^[0-9]{10,15}$/.test(mobileNo)) {
        return NextResponse.json({ success: false, message: "Invalid mobile number" }, { status: 400 })
      }
      updateFields.mobileNo = mobileNo
    }

    if (body.status) {
      const status = String(body.status).toLowerCase()
      if (!['pending','approved','rejected'].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
      }
      updateFields.status = status
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 })
    }

    await db.update(schema.voters).set(updateFields).where(eq(schema.voters.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update voter", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, message: "Voter id is required" }, { status: 400 })
    }

    const voterIdInt = parseInt(id)

    await db.transaction(async (tx) => {
      await tx.delete(schema.votes).where(eq(schema.votes.voterId, voterIdInt))
      await tx.delete(schema.voterPasskeyCredentials).where(eq(schema.voterPasskeyCredentials.voterId, voterIdInt))
      await tx.delete(schema.voters).where(eq(schema.voters.id, voterIdInt))
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete voter", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
