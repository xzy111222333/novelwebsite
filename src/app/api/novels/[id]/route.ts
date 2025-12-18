// app/api/novels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const novelId = params.id

    const novel = await db.novel.findUnique({
      where: {
        id: novelId
      },
      include: {
        chapters: {
          orderBy: {
            order: 'asc',
          },
        },
        characters: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        worldBuilding: true,
        outlines: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!novel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    const novelWithStats = {
      ...novel,
      wordCount: novel.chapters.reduce((total, chapter) => total + chapter.wordCount, 0),
      chapterCount: novel.chapters.length,
      tags: novel.tags ? JSON.parse(novel.tags) : [],
    }

    return NextResponse.json({
      success: true,
      novel: novelWithStats,
    })

  } catch (error) {
    console.error('获取小说详情失败:', error)
    return NextResponse.json(
      {
        error: '获取小说详情失败',
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
    const novelId = params.id
    const body = await request.json()

    // 检查小说是否存在（但不检查用户权限）
    const existingNovel = await db.novel.findUnique({
      where: { id: novelId }
    })

    if (!existingNovel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    const novel = await db.novel.update({
      where: { id: novelId },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        genre: body.genre,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        status: body.status,
        coverImage: body.coverImage,
      },
    })

    return NextResponse.json({
      success: true,
      novel: {
        ...novel,
        tags: novel.tags ? JSON.parse(novel.tags) : [],
      },
    })

  } catch (error) {
    console.error('更新小说失败:', error)
    return NextResponse.json(
      {
        error: '更新小说失败',
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
    const novelId = params.id

    // 检查小说是否存在（但不检查用户权限）
    const existingNovel = await db.novel.findUnique({
      where: { id: novelId }
    })

    if (!existingNovel) {
      return NextResponse.json(
        { error: '小说不存在' },
        { status: 404 }
      )
    }

    await db.novel.delete({
      where: { id: novelId },
    })

    return NextResponse.json({
      success: true,
      message: '小说已删除',
    })

  } catch (error) {
    console.error('删除小说失败:', error)
    return NextResponse.json(
      {
        error: '删除小说失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}