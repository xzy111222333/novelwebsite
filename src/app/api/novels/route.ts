// app/api/novels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recalculateNovelStats } from '@/lib/novel-helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 保留会话获取，但不用于权限检查
    const session = await getServerSession(authOptions)
    console.log('用户会话:', session?.user?.email)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const status = searchParams.get('status')?.trim()
    const sort = searchParams.get('sort') || 'updatedAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    const tag = searchParams.get('tag')?.trim()

    // 构建查询条件
    const where: any = {}

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // 状态条件
    if (status) {
      where.status = status
    }

    // 标签条件
    if (tag) {
      where.tags = {
        contains: tag
      }
    }

    console.log('查询条件:', where)

    const novels = await db.novel.findMany({
      where,
      orderBy:
        sort === 'createdAt'
          ? { createdAt: order }
          : sort === 'title'
            ? { title: order }
            : { updatedAt: order },
      include: {
        chapters: {
          select: {
            id: true,
            title: true,
            wordCount: true,
            order: true,
            status: true,
            updatedAt: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            chapters: true,
            characters: true,
          },
        },
      },
    })

    const novelsWithStats = novels.map((novel) => ({
      ...novel,
      wordCount: novel.chapters.reduce((total, chapter) => total + chapter.wordCount, 0),
      chapterCount: novel.chapters.length,
      tags: novel.tags ? JSON.parse(novel.tags) : [],
    }))

    console.log(`找到 ${novelsWithStats.length} 部小说`)

    return NextResponse.json({
      success: true,
      novels: novelsWithStats,
    })

  } catch (error) {
    console.error('获取小说列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取小说列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 保留会话获取，用于记录创建者（可选）
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const body = await request.json()
    const { title, description, genre, tags, coverImage } = body

    console.log('创建小说请求:', { title, userId })

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: '小说标题不能为空' 
        },
        { status: 400 }
      )
    }

    // 创建小说，userId 为可选
    const novel = await db.novel.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        genre: genre || null,
        status: 'draft',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
        coverImage: coverImage || null,
        userId: userId, // 如果有登录用户就关联，否则为 null
      },
    })

    console.log('小说创建成功:', novel.id)

    await recalculateNovelStats(novel.id)

    return NextResponse.json({
      success: true,
      novel: {
        ...novel,
        tags: Array.isArray(tags) ? tags : [],
        wordCount: 0,
        chapterCount: 0,
      },
    })

  } catch (error) {
    console.error('创建小说失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '创建小说失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}