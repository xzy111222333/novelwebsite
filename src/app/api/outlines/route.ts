import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelNovel, toCamelOutline } from "@/lib/fastapi"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get("novelId")?.trim()

    const enrichWithNovel = async (nid: string, outlinesJson: any[]) => {
      const novelRes = await fastapiFetch(`/novels/${nid}`, { accessToken: user.accessToken })
      const novelJson = await novelRes.json().catch(() => ({}))
      const novelTitle = novelRes.ok ? toCamelNovel(novelJson).title : ""
      return outlinesJson.map((o: any) => ({
        ...toCamelOutline(o),
        novel: { id: nid, title: novelTitle },
      }))
    }

    if (novelId) {
      const res = await fastapiFetch(`/novels/${novelId}/outlines/`, { accessToken: user.accessToken })
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        return NextResponse.json({ error: data?.detail || "获取大纲列表失败" }, { status: res.status })
      }
      return NextResponse.json({
        success: true,
        outlines: await enrichWithNovel(novelId, Array.isArray(data) ? data : []),
      })
    }

    const novelsRes = await fastapiFetch("/novels/", { accessToken: user.accessToken })
    const novelsJson = await novelsRes.json().catch(() => [])
    if (!novelsRes.ok) {
      return NextResponse.json({ error: novelsJson?.detail || "获取大纲列表失败" }, { status: novelsRes.status })
    }

    const novels = Array.isArray(novelsJson) ? novelsJson : []
    const all = await Promise.all(
      novels.map(async (n: any) => {
        const res = await fastapiFetch(`/novels/${n.id}/outlines/`, { accessToken: user.accessToken })
        const data = await res.json().catch(() => [])
        if (!res.ok) return []
        return enrichWithNovel(n.id, Array.isArray(data) ? data : [])
      })
    )

    return NextResponse.json({ success: true, outlines: all.flat() })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取大纲列表失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    if (!body?.novelId) {
      return NextResponse.json({ error: "novelId 不能为空" }, { status: 400 })
    }
    if (!body?.title || !String(body.title).trim()) {
      return NextResponse.json({ error: "大纲标题不能为空" }, { status: 400 })
    }

    const listRes = await fastapiFetch(`/novels/${body.novelId}/outlines/`, { accessToken: user.accessToken })
    const listJson = await listRes.json().catch(() => [])
    const outlines = Array.isArray(listJson) ? listJson : []
    const nextOrder = outlines.reduce((max: number, o: any) => Math.max(max, o.order || 0), 0) + 1

    const res = await fastapiFetch(`/novels/${body.novelId}/outlines/`, {
      method: "POST",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(body.title).trim(),
        content: body.content ?? null,
        chapter_range: body.chapterRange ?? null,
        order: nextOrder,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "创建大纲失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, outline: toCamelOutline(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "创建大纲失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
