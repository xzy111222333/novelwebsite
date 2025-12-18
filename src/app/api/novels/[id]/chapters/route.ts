import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelChapter } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const novelId = params.id

    const res = await fastapiFetch(`/novels/${novelId}/chapters/`, { accessToken: user.accessToken })
    const data = await res.json().catch(() => [])
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "获取章节列表失败" }, { status: res.status })
    }

    return NextResponse.json({
      success: true,
      chapters: (Array.isArray(data) ? data : []).map((c: any) => toCamelChapter(c)),
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取章节列表失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const novelId = params.id
    const body = await request.json()

    if (!body?.title || !String(body.title).trim()) {
      return NextResponse.json({ error: "章节标题不能为空" }, { status: 400 })
    }

    const res = await fastapiFetch(`/novels/${novelId}/chapters/`, {
      method: "POST",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(body.title).trim(),
        content: body.content || "",
        summary: body.summary ?? null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "创建章节失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, chapter: toCamelChapter(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "创建章节失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
