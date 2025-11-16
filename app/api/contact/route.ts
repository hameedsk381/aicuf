import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT } from "@/lib/constants"
import { logger } from "@/lib/logger"
import { db, schema } from "@/lib/db"
import * as z from "zod"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    
    const rateLimitResult = checkRateLimit(`contact:${ip}`, RATE_LIMIT.CONTACT)

    if (!rateLimitResult.success) {
      logger.warn("Contact rate limit exceeded", { ip })
      return NextResponse.json(
        {
          success: false,
          message: "Too many contact attempts. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const rawData = await request.json()
    const data = contactSchema.parse(rawData)

    logger.info("Contact submission received", {
      name: data.name,
      email: data.email,
      subject: data.subject,
    })

    const [contact] = await db.insert(schema.contacts).values({
      ...data,
      status: "new",
    }).returning()

    logger.info("Contact saved to database", {
      id: contact.id,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        { status: 400 }
      )
    }

    logger.error("Contact submission failed", { error: error instanceof Error ? error.message : "Unknown error" }, error as Error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
