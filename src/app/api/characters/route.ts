import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelCharacter, toCamelNovel } from "@/lib/fastapi"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get("novelId")?.trim()

    const enrichWithNovel = async (nid: string, charactersJson: any[]) => {
      const novelRes = await fastapiFetch(`/novels/${nid}`, { accessToken: user.accessToken })
      const novelJson = await novelRes.json().catch(() => ({}))
      const novelTitle = novelRes.ok ? toCamelNovel(novelJson).title : ""
      return charactersJson.map((c: any) => ({
        ...toCamelCharacter(c),
        novel: { id: nid, title: novelTitle },
      }))
    }

    if (novelId) {
      const res = await fastapiFetch(`/novels/${novelId}/characters/`, { accessToken: user.accessToken })
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        return NextResponse.json({ error: data?.detail || "获取角色列表失败" }, { status: res.status })
      }
      const list = Array.isArray(data) ? data : []
      return NextResponse.json({ success: true, characters: await enrichWithNovel(novelId, list) })
    }

    const novelsRes = await fastapiFetch("/novels/", { accessToken: user.accessToken })
    const novelsJson = await novelsRes.json().catch(() => [])
    if (!novelsRes.ok) {
      return NextResponse.json({ error: novelsJson?.detail || "获取角色列表失败" }, { status: novelsRes.status })
    }

    const novels = Array.isArray(novelsJson) ? novelsJson : []
    const all = await Promise.all(
      novels.map(async (n: any) => {
        const res = await fastapiFetch(`/novels/${n.id}/characters/`, { accessToken: user.accessToken })
        const data = await res.json().catch(() => [])
        if (!res.ok) return []
        return enrichWithNovel(n.id, Array.isArray(data) ? data : [])
      })
    )

    return NextResponse.json({ success: true, characters: all.flat() })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取角色列表失败", details: error instanceof Error ? error.message : "未知错误" },
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
    if (!body?.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "角色名称不能为空" }, { status: 400 })
    }

    const res = await fastapiFetch(`/novels/${body.novelId}/characters/`, {
      method: "POST",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(body.name).trim(),
        description: body.description ?? null,
        avatar: body.avatar ?? null,
        personality: body.personality ?? null,
        background: body.background ?? null,
        relationships: body.relationships ?? null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "创建角色失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, character: toCamelCharacter(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "创建角色失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
