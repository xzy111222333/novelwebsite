// app/api/characters/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const novelId = searchParams.get('novelId')

    const characters = await db.character.findMany({
      where: {
        novel: {
          userId: user.id,
          ...(novelId ? { id: novelId } : {})
        }
      },
      include: {
        novel: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      characters,
    })

  } catch (error) {
    console.error('获取角色列表失败:', error)
    return NextResponse.json(
      {
        error: '获取角色列表失败',
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

    const character = await db.character.create({
      data: {
        name: body.name.trim(),
        description: body.description,
        avatar: body.avatar,
        personality: body.personality,
        background: body.background,
        relationships: body.relationships,
        novelId: body.novelId,
      },
    })

    return NextResponse.json({
      success: true,
      character,
    })

  } catch (error) {
    console.error('创建角色失败:', error)
    return NextResponse.json(
      {
        error: '创建角色失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}