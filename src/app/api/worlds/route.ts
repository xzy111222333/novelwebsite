import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelNovel, toCamelWorldBuilding } from "@/lib/fastapi"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get("novelId")?.trim()

    const res = await fastapiFetch(`/world-buildings/${novelId ? `?novel_id=${encodeURIComponent(novelId)}` : ""}`, {
      accessToken: user.accessToken,
    })
    const data = await res.json().catch(() => [])
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "获取世界观列表失败" }, { status: res.status })
    }

    const list = (Array.isArray(data) ? data : []).map((wb: any) => toCamelWorldBuilding(wb))

    const novelsRes = await fastapiFetch("/novels/", { accessToken: user.accessToken })
    const novelsJson = await novelsRes.json().catch(() => [])
    const novelMap = new Map<string, string>()
    if (novelsRes.ok && Array.isArray(novelsJson)) {
      novelsJson.forEach((n: any) => novelMap.set(n.id, toCamelNovel(n).title))
    }

    const worlds = list.map((wb: any) => ({
      ...wb,
      novel: { id: wb.novelId, title: novelMap.get(wb.novelId) || "" },
    }))

    return NextResponse.json({ success: true, worlds })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取世界观列表失败", details: error instanceof Error ? error.message : "未知错误" },
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
      return NextResponse.json({ error: "世界观标题不能为空" }, { status: 400 })
    }
    if (!body?.content) {
      return NextResponse.json({ error: "世界观内容不能为空" }, { status: 400 })
    }

    const res = await fastapiFetch(`/novels/${body.novelId}/world-building/`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(body.title).trim(),
        content: body.content,
        type: body.type || "setting",
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "保存世界观失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, world: toCamelWorldBuilding(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "创建世界观失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
