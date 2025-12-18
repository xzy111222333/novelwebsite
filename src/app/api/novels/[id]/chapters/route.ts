// app/api/novels/[id]/chapters/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recalculateNovelStats } from '@/lib/novel-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const novelId = params.id

    // 检查小说是否存在
    const novel = await db.novel.findUnique({
      where: { id: novelId }
    })

    if (!novel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    const chapters = await db.chapter.findMany({
      where: {
        novelId: novelId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      chapters,
    })

  } catch (error) {
    console.error('获取章节列表失败:', error)
    return NextResponse.json(
      {
        error: '获取章节列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const novelId = params.id
    const body = await request.json()

    console.log('创建章节请求:', { novelId, title: body.title })

    // 检查小说是否存在
    const novel = await db.novel.findUnique({
      where: { id: novelId }
    })

    if (!novel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    // 获取当前最大 order 值
    const lastChapter = await db.chapter.findFirst({
      where: { novelId },
      orderBy: { order: 'desc' },
    })

    const nextOrder = lastChapter ? lastChapter.order + 1 : 1

    const chapter = await db.chapter.create({
      data: {
        title: body.title.trim(),
        content: body.content || '',
        summary: body.summary || null,
        wordCount: body.content?.length || 0,
        order: nextOrder,
        status: 'draft',
        novelId: novelId,
      },
    })

    console.log('章节创建成功:', chapter.id)

    await recalculateNovelStats(novelId)

    return NextResponse.json({
      success: true,
      chapter,
    })

  } catch (error) {
    console.error('创建章节失败:', error)
    return NextResponse.json(
      {
        error: '创建章节失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}