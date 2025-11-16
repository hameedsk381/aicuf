import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), "public", "uploads", "noc", filename)

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      )
    }

    const fileBuffer = await readFile(filePath)
    const extension = filename.split(".").pop()?.toLowerCase()

    // Set appropriate content type
    let contentType = "application/octet-stream"
    if (extension === "pdf") {
      contentType = "application/pdf"
    } else if (["jpg", "jpeg"].includes(extension || "")) {
      contentType = "image/jpeg"
    } else if (extension === "png") {
      contentType = "image/png"
    } else if (extension === "gif") {
      contentType = "image/gif"
    } else if (extension === "webp") {
      contentType = "image/webp"
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { success: false, message: "Error reading file" },
      { status: 500 }
    )
  }
}
