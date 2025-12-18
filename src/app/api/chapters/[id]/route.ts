import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelChapter, toCamelNovel } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const chapterId = params.id

    const chapterRes = await fastapiFetch(`/chapters/${chapterId}`, { accessToken: user.accessToken })
    const chapterJson = await chapterRes.json().catch(() => ({}))
    if (!chapterRes.ok) {
      return NextResponse.json({ error: chapterJson?.detail || "章节不存在" }, { status: chapterRes.status })
    }

    const chapter = toCamelChapter(chapterJson)

    const novelRes = await fastapiFetch(`/novels/${chapter.novelId}`, { accessToken: user.accessToken })
    const novelJson = await novelRes.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      chapter: {
        ...chapter,
        novel: novelRes.ok ? { id: novelJson.id, title: toCamelNovel(novelJson).title } : undefined,
      },
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取章节详情失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const chapterId = params.id
    const body = await request.json()

    const res = await fastapiFetch(`/chapters/${chapterId}`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title?.trim(),
        content: body.content,
        summary: body.summary,
        order: body.order,
        status: body.status,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "更新章节失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, chapter: toCamelChapter(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "更新章节失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const chapterId = params.id

    const res = await fastapiFetch(`/chapters/${chapterId}`, { method: "DELETE", accessToken: user.accessToken })
    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "章节已删除" })
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "删除章节失败" }, { status: res.status })
    }
    return NextResponse.json({ success: true, message: "章节已删除" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "删除章节失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
