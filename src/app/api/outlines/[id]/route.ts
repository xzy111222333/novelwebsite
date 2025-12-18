// app/api/outlines/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const outlineId = params.id

    const outline = await db.outline.findFirst({
      where: {
        id: outlineId,
        novel: {
          userId: user.id
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
    })

    if (!outline) {
      return NextResponse.json(
        { error: '大纲不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      outline,
    })

  } catch (error) {
    console.error('获取大纲详情失败:', error)
    return NextResponse.json(
      {
        error: '获取大纲详情失败',
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
    const user = await requireAuth()
    const outlineId = params.id
    const body = await request.json()

    // 检查大纲是否存在且属于当前用户
    const existingOutline = await db.outline.findFirst({
      where: {
        id: outlineId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingOutline) {
      return NextResponse.json(
        { error: '大纲不存在' },
        { status: 404 }
      )
    }

    const outline = await db.outline.update({
      where: { id: outlineId },
      data: {
        title: body.title?.trim(),
        content: body.content,
        chapterRange: body.chapterRange,
        order: body.order,
      },
    })

    return NextResponse.json({
      success: true,
      outline,
    })

  } catch (error) {
    console.error('更新大纲失败:', error)
    return NextResponse.json(
      {
        error: '更新大纲失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const outlineId = params.id

    // 检查大纲是否存在且属于当前用户
    const existingOutline = await db.outline.findFirst({
      where: {
        id: outlineId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingOutline) {
      return NextResponse.json(
        { error: '大纲不存在' },
        { status: 404 }
      )
    }

    await db.outline.delete({
      where: { id: outlineId },
    })

    return NextResponse.json({
      success: true,
      message: '大纲已删除',
    })

  } catch (error) {
    console.error('删除大纲失败:', error)
    return NextResponse.json(
      {
        error: '删除大纲失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}