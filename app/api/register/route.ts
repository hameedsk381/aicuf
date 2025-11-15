import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { validateAndSanitizeRegistrationData } from "@/lib/sanitize"
import { RATE_LIMIT } from "@/lib/constants"
import { logger } from "@/lib/logger"
import { sendEmail, getRegistrationConfirmationEmail } from "@/lib/email"
import { db, schema } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    
    const rateLimitResult = checkRateLimit(`register:${ip}`, RATE_LIMIT.REGISTRATION)

    if (!rateLimitResult.success) {
      logger.warn("Registration rate limit exceeded", { ip })
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const rawData = await request.json()
    const data = validateAndSanitizeRegistrationData(rawData)

    logger.info("Registration received", {
      type: data.applicationType,
      name: data.name,
      email: data.emailId,
    })

    const registrationId = `REG-${Date.now()}`

    const registration = db.insert(schema.registrations).values({
      ...data,
      skills: JSON.stringify(data.skills || []),
      registrationId,
    }).returning().get()

    logger.info("Registration saved to database", {
      id: registration.id,
      registrationId,
    })

    const emailHtml = getRegistrationConfirmationEmail({
      name: data.name,
      applicationType: data.applicationType,
      registrationId,
    })

    sendEmail({
      to: data.emailId,
      subject: 'APTSAICUF Registration Confirmation',
      html: emailHtml,
    }).catch((error) => {
      logger.warn("Failed to send confirmation email", { error })
    })

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully",
      data: {
        registrationId,
        applicationType: data.applicationType,
        name: data.name,
      },
    }, {
      headers: {
        'X-RateLimit-Limit': '3',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    })
  } catch (error) {
    logger.error("Registration failed", { error: error instanceof Error ? error.message : "Unknown error" }, error as Error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit registration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
