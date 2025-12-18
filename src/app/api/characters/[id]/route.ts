import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelCharacter, toCamelNovel } from "@/lib/fastapi"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const characterId = params.id

    const res = await fastapiFetch(`/characters/${characterId}`, { accessToken: user.accessToken })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "角色不存在" }, { status: res.status })
    }

    const character = toCamelCharacter(data)

    const novelRes = await fastapiFetch(`/novels/${character.novelId}`, { accessToken: user.accessToken })
    const novelJson = await novelRes.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      character: {
        ...character,
        novel: novelRes.ok ? { id: novelJson.id, title: toCamelNovel(novelJson).title } : undefined,
      },
    })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "获取角色详情失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const characterId = params.id
    const body = await request.json()

    const res = await fastapiFetch(`/characters/${characterId}`, {
      method: "PUT",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name?.trim(),
        description: body.description,
        avatar: body.avatar,
        personality: body.personality,
        background: body.background,
        relationships: body.relationships,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "更新角色失败" }, { status: res.status })
    }

    return NextResponse.json({ success: true, character: toCamelCharacter(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "更新角色失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const characterId = params.id

    const res = await fastapiFetch(`/characters/${characterId}`, { method: "DELETE", accessToken: user.accessToken })
    if (res.status === 204) {
      return NextResponse.json({ success: true, message: "角色已删除" })
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "删除角色失败" }, { status: res.status })
    }
    return NextResponse.json({ success: true, message: "角色已删除" })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "删除角色失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
