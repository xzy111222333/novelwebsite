import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch } from "@/lib/fastapi"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const res = await fastapiFetch("/ai/refine", {
      method: "POST",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.detail || "扩写润色失败" },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: "扩写润色失败，请稍后重试", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

