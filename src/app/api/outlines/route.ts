// app/api/outlines/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get('novelId')

    const outlines = await db.outline.findMany({
      where: {
        novel: {
          userId: user.id,
          ...(novelId ? { id: novelId } : {})
        }
      },
      include: {
        novel: {
          select: {
            title: true,
            id: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      outlines,
    })

  } catch (error) {
    console.error('获取大纲列表失败:', error)
    return NextResponse.json(
      {
        error: '获取大纲列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // 检查小说是否存在且属于当前用户
    const novel = await db.novel.findFirst({
      where: {
        id: body.novelId,
        userId: user.id
      }
    })

    if (!novel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    // 获取当前最大 order 值
    const lastOutline = await db.outline.findFirst({
      where: { novelId: body.novelId },
      orderBy: { order: 'desc' },
    })

    const nextOrder = lastOutline ? lastOutline.order + 1 : 1

    const outline = await db.outline.create({
      data: {
        title: body.title.trim(),
        content: body.content,
        chapterRange: body.chapterRange,
        order: nextOrder,
        novelId: body.novelId,
      },
    })

    return NextResponse.json({
      success: true,
      outline,
    })

  } catch (error) {
    console.error('创建大纲失败:', error)
    return NextResponse.json(
      {
        error: '创建大纲失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}