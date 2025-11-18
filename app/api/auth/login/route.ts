import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { registrations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key")

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await db.query.registrations.findFirst({
      where: eq(registrations.emailId, email),
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { error: "Account exists but no password set. Please contact admin." },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.emailId,
      role: user.role
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Create response with cookie
    const response = NextResponse.json({ success: true })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
