import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAuth } from "@/lib/session"
import { fastapiFetch, toCamelChapter, toCamelNovel } from "@/lib/fastapi"

function sortKeyValue(value: any) {
  if (typeof value === "string") return value
  if (typeof value === "number") return value
  return ""
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim()
    const status = searchParams.get("status")?.trim()
    const sort = searchParams.get("sort") || "updatedAt"
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"
    const tag = searchParams.get("tag")?.trim()

    const res = await fastapiFetch("/novels/", { accessToken: user.accessToken })
    const data = await res.json().catch(() => [])
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.detail || "获取小说列表失败" },
        { status: res.status }
      )
    }

    const novels = Array.isArray(data) ? data : []

    const novelsWithChapters = await Promise.all(
      novels.map(async (novel: any) => {
        const chaptersRes = await fastapiFetch(`/novels/${novel.id}/chapters/`, {
          accessToken: user.accessToken,
        })
        const chaptersJson = await chaptersRes.json().catch(() => [])
        const chapters = (Array.isArray(chaptersJson) ? chaptersJson : []).map((c: any) => {
          const mapped = toCamelChapter(c)
          return {
            id: mapped.id,
            title: mapped.title,
            wordCount: mapped.wordCount,
            order: mapped.order,
            status: mapped.status,
            updatedAt: mapped.updatedAt,
          }
        })

        return {
          ...toCamelNovel(novel),
          chapters,
        }
      })
    )

    let filtered = novelsWithChapters

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((n) => {
        const title = (n.title || "").toLowerCase()
        const desc = (n.description || "").toLowerCase()
        return title.includes(q) || desc.includes(q)
      })
    }

    if (status) {
      filtered = filtered.filter((n) => n.status === status)
    }

    if (tag) {
      filtered = filtered.filter((n) => Array.isArray(n.tags) && n.tags.includes(tag))
    }

    filtered.sort((a: any, b: any) => {
      const field =
        sort === "createdAt" ? "createdAt" : sort === "title" ? "title" : "updatedAt"
      const av = sortKeyValue(a[field])
      const bv = sortKeyValue(b[field])
      if (av < bv) return order === "asc" ? -1 : 1
      if (av > bv) return order === "asc" ? 1 : -1
      return 0
    })

    return NextResponse.json({ success: true, novels: filtered })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: "获取小说列表失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { title, description, genre, tags } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: "小说标题不能为空" }, { status: 400 })
    }

    const res = await fastapiFetch("/novels/", {
      method: "POST",
      accessToken: user.accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description?.trim() || null,
        genre: genre || null,
        status: "draft",
        tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.detail || "创建小说失败" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true, novel: toCamelNovel(data) })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: "创建小说失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
