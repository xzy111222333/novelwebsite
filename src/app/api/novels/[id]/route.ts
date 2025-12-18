import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import {
  fastapiFetch,
  toCamelChapter,
  toCamelCharacter,
  toCamelNovel,
  toCamelOutline,
  toCamelWorldBuilding,
} from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const novelId = params.id

    const [novelRes, chaptersRes, charactersRes, outlinesRes, worldRes] = await Promise.all([
      fastapiFetch(`/novels/${novelId}`, { accessToken: user.accessToken }),
      fastapiFetch(`/novels/${novelId}/chapters/`, { accessToken: user.accessToken }),
      fastapiFetch(`/novels/${novelId}/characters/`, { accessToken: user.accessToken }),
      fastapiFetch(`/novels/${novelId}/outlines/`, { accessToken: user.accessToken }),
      fastapiFetch(`/novels/${novelId}/world-building/`, { accessToken: user.accessToken }),
    ])

    const novelJson = await novelRes.json().catch(() => ({}))
    if (!novelRes.ok) {
      return NextResponse.json({ error: novelJson?.detail || "小说不存在" }, { status: novelRes.status })
    }

    const chaptersJson = await chaptersRes.json().catch(() => [])
    const charactersJson = await charactersRes.json().catch(() => [])
    const outlinesJson = await outlinesRes.json().catch(() => [])
    const worldJson = await worldRes.json().catch(() => ({}))

    const chapters = (Array.isArray(chaptersJson) ? chaptersJson : []).map((c: any) => toCamelChapter(c))
    const characters = (Array.isArray(charactersJson) ? charactersJson : []).map((c: any) => toCamelCharacter(c))
    const outlines = (Array.isArray(outlinesJson) ? outlinesJson : []).map((o: any) => toCamelOutline(o))
    const worldBuilding = worldRes.ok ? toCamelWorldBuilding(worldJson) : null

    const novel = {
      ...toCamelNovel(novelJson),
      chapters,
      characters,
      outlines,
      worldBuilding,
    }

    return NextResponse.json({ success: true, novel })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取小说详情失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const novelId = params.id
    const body = await request.json()

    const res = await fastapiFetch(`/novels/${novelId}`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title?.trim(),
        description: body.description?.trim(),
        genre: body.genre ?? null,
        status: body.status ?? null,
        tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags ?? null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "更新小说失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, novel: toCamelNovel(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "更新小说失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const novelId = params.id

    const res = await fastapiFetch(`/novels/${novelId}`, { method: "DELETE", accessToken: user.accessToken })
    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "小说已删除" })
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "删除小说失败" }, { status: res.status })
    }
    return NextResponse.json({ success: true, message: "小说已删除" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "删除小说失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
