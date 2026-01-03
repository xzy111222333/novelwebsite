import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAdmin } from "@/lib/session"
import { fastapiFetch } from "@/lib/fastapi"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const res = await fastapiFetch("/admin/novels", { accessToken: user.accessToken })
    const data = await res.json().catch(() => [])
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to fetch novels" },
        { status: res.status }
      )
    }
    return NextResponse.json({ success: true, novels: Array.isArray(data) ? data : [] })
  } catch (error) {
    if (isAuthError(error)) {
      const status = (error as any).statusCode || 401
      return NextResponse.json({ error: "Unauthorized" }, { status })
    }
    return NextResponse.json(
      { error: "Failed to fetch novels", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
