import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAdmin } from "@/lib/session"
import { fastapiFetch } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const res = await fastapiFetch(`/admin/novels/${params.id}`, { accessToken: user.accessToken })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to fetch novel" },
        { status: res.status }
      )
    }
    return NextResponse.json({ success: true, novel: data })
  } catch (error) {
    if (isAuthError(error)) {
      const status = (error as any).statusCode || 401
      return NextResponse.json({ error: "Unauthorized" }, { status })
    }
    return NextResponse.json(
      { error: "Failed to fetch novel", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const res = await fastapiFetch(`/admin/novels/${params.id}`, {
      method: "PATCH",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to update novel" },
        { status: res.status }
      )
    }
    return NextResponse.json({ success: true, novel: data })
  } catch (error) {
    if (isAuthError(error)) {
      const status = (error as any).statusCode || 401
      return NextResponse.json({ error: "Unauthorized" }, { status })
    }
    return NextResponse.json(
      { error: "Failed to update novel", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
