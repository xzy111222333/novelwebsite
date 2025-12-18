import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelNovel, toCamelOutline } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const outlineId = params.id

    const res = await fastapiFetch(`/outlines/${outlineId}`, { accessToken: user.accessToken })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "大纲不存在" }, { status: res.status })
    }

    const outline = toCamelOutline(data)
    const novelRes = await fastapiFetch(`/novels/${outline.novelId}`, { accessToken: user.accessToken })
    const novelJson = await novelRes.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      outline: {
        ...outline,
        novel: novelRes.ok ? { id: novelJson.id, title: toCamelNovel(novelJson).title } : undefined,
      },
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取大纲详情失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const outlineId = params.id
    const body = await request.json()

    const res = await fastapiFetch(`/outlines/${outlineId}`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title?.trim(),
        content: body.content,
        chapter_range: body.chapterRange,
        order: body.order,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "更新大纲失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, outline: toCamelOutline(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "更新大纲失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const outlineId = params.id

    const res = await fastapiFetch(`/outlines/${outlineId}`, { method: "DELETE", accessToken: user.accessToken })
    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "大纲已删除" })
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "删除大纲失败" }, { status: res.status })
    }
    return NextResponse.json({ success: true, message: "大纲已删除" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "删除大纲失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
