import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, "Size:", file.size, "bytes")

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.error("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 50MB" }, { status: 400 })
    }

    // Upload to Vercel Blob with a unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    console.log("[v0] Uploading to Vercel Blob as:", filename)

    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("[v0] Upload successful, URL:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
