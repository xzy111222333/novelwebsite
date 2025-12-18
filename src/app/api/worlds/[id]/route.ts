import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelNovel, toCamelWorldBuilding } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const worldId = params.id

    const res = await fastapiFetch(`/world-buildings/${worldId}`, { accessToken: user.accessToken })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "世界观设定不存在" }, { status: res.status })
    }

    const world = toCamelWorldBuilding(data)
    const novelRes = await fastapiFetch(`/novels/${world.novelId}`, { accessToken: user.accessToken })
    const novelJson = await novelRes.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      world: {
        ...world,
        novel: novelRes.ok ? { id: novelJson.id, title: toCamelNovel(novelJson).title } : undefined,
      },
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取世界观详情失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const worldId = params.id
    const body = await request.json()

    const res = await fastapiFetch(`/world-buildings/${worldId}`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title?.trim(),
        content: body.content,
        type: body.type,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "更新世界观失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, world: toCamelWorldBuilding(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "更新世界观失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const worldId = params.id

    const res = await fastapiFetch(`/world-buildings/${worldId}`, { method: "DELETE", accessToken: user.accessToken })
    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "世界观设定已删除" })
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "删除世界观失败" }, { status: res.status })
    }
    return NextResponse.json({ success: true, message: "世界观设定已删除" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "删除世界观失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
