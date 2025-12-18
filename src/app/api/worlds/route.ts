// app/api/worlds/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get('novelId')

    const worlds = await db.worldBuilding.findMany({
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      worlds,
    })

  } catch (error) {
    console.error('获取世界观列表失败:', error)
    return NextResponse.json(
      {
        error: '获取世界观列表失败',
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

    // 检查是否已存在世界观设定
    const existingWorld = await db.worldBuilding.findUnique({
      where: {
        novelId: body.novelId
      }
    })

    if (existingWorld) {
      return NextResponse.json(
        { error: '该小说已存在世界观设定' },
        { status: 400 }
      )
    }

    const world = await db.worldBuilding.create({
      data: {
        title: body.title.trim(),
        content: body.content,
        type: body.type || 'setting',
        novelId: body.novelId,
      },
    })

    return NextResponse.json({
      success: true,
      world,
    })

  } catch (error) {
    console.error('创建世界观失败:', error)
    return NextResponse.json(
      {
        error: '创建世界观失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}