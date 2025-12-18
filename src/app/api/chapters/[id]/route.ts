// app/api/chapters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recalculateNovelStats } from '@/lib/novel-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId
      },
      include: {
        novel: true,
      },
    })

    if (!chapter) {
      return NextResponse.json(
        { error: '章节不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      chapter,
    })

  } catch (error) {
    console.error('获取章节详情失败:', error)
    return NextResponse.json(
      {
        error: '获取章节详情失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id
    const body = await request.json()

    // 检查章节是否存在
    const existingChapter = await db.chapter.findUnique({
      where: { id: chapterId }
    })

    if (!existingChapter) {
      return NextResponse.json(
        { error: '章节不存在' },
        { status: 404 }
      )
    }

    const chapter = await db.chapter.update({
      where: { id: chapterId },
      data: {
        title: body.title?.trim(),
        content: body.content,
        summary: body.summary,
        wordCount: body.content?.length || 0,
        status: body.status,
      },
    })

    await recalculateNovelStats(existingChapter.novelId)

    return NextResponse.json({
      success: true,
      chapter,
    })

  } catch (error) {
    console.error('更新章节失败:', error)
    return NextResponse.json(
      {
        error: '更新章节失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}