import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key")

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Protect member routes
    if (path.startsWith("/member")) {
        // Allow access to login page
        if (path === "/member/login") {
            return NextResponse.next()
        }

        const token = request.cookies.get("token")?.value

        if (!token) {
            return NextResponse.redirect(new URL("/member/login", request.url))
        }

        try {
            await jwtVerify(token, JWT_SECRET)
            return NextResponse.next()
        } catch (error) {
            return NextResponse.redirect(new URL("/member/login", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/member/:path*"],
}
