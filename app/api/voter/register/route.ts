import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT } from "@/lib/constants"
import { logger } from "@/lib/logger"
import { db, schema } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sanitizeInput, sanitizePhoneNumber } from "@/lib/sanitize"

function generateVoterId() {
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `VOTER-${Date.now()}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rate = checkRateLimit(`voter-register:${ip}`, RATE_LIMIT.REGISTRATION)
    if (!rate.success) {
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.REGISTRATION.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rate.resetTime.toString(),
          },
        }
      )
    }

    const body = await req.json()
    const name = sanitizeInput(body.name || "")
    const designation = sanitizeInput(body.designation || "")
    const unitName = sanitizeInput(body.unitName || "")
    const mobileNo = sanitizePhoneNumber(body.mobileNo || "")
    if (!name || !designation || !unitName || !mobileNo) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    if (!/^[0-9]{10,15}$/.test(mobileNo)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 }
      )
    }

    const voterId = generateVoterId()
    await db.insert(schema.voters).values({
      voterId,
      name,
      designation,
      unitName,
      mobileNo,
      status: "pending",
      createdAt: new Date(),
    })

    logger.info("Voter registered", { voterId, unitName })

    return NextResponse.json(
      { success: true, voterId },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT.REGISTRATION.maxRequests.toString(),
          "X-RateLimit-Remaining": rate.remaining.toString(),
          "X-RateLimit-Reset": rate.resetTime.toString(),
        },
      }
    )
  } catch (error) {
    logger.error("Voter registration failed", undefined, error as Error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register voter",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
