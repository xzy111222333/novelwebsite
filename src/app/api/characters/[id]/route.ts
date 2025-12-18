// app/api/characters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const characterId = params.id

    const character = await db.character.findFirst({
      where: {
        id: characterId,
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

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      character,
    })

  } catch (error) {
    console.error('获取角色详情失败:', error)
    return NextResponse.json(
      {
        error: '获取角色详情失败',
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
    const characterId = params.id
    const body = await request.json()

    // 检查角色是否存在且属于当前用户
    const existingCharacter = await db.character.findFirst({
      where: {
        id: characterId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingCharacter) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      )
    }

    const character = await db.character.update({
      where: { id: characterId },
      data: {
        name: body.name?.trim(),
        description: body.description,
        avatar: body.avatar,
        personality: body.personality,
        background: body.background,
        relationships: body.relationships,
      },
    })

    return NextResponse.json({
      success: true,
      character,
    })

  } catch (error) {
    console.error('更新角色失败:', error)
    return NextResponse.json(
      {
        error: '更新角色失败',
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
    const characterId = params.id

    // 检查角色是否存在且属于当前用户
    const existingCharacter = await db.character.findFirst({
      where: {
        id: characterId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingCharacter) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      )
    }

    await db.character.delete({
      where: { id: characterId },
    })

    return NextResponse.json({
      success: true,
      message: '角色已删除',
    })

  } catch (error) {
    console.error('删除角色失败:', error)
    return NextResponse.json(
      {
        error: '删除角色失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}