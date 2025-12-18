// app/api/worlds/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const worldId = params.id

    const world = await db.worldBuilding.findFirst({
      where: {
        id: worldId,
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

    if (!world) {
      return NextResponse.json(
        { error: '世界观设定不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      world,
    })

  } catch (error) {
    console.error('获取世界观详情失败:', error)
    return NextResponse.json(
      {
        error: '获取世界观详情失败',
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
    const worldId = params.id
    const body = await request.json()

    // 检查世界观是否存在且属于当前用户
    const existingWorld = await db.worldBuilding.findFirst({
      where: {
        id: worldId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingWorld) {
      return NextResponse.json(
        { error: '世界观设定不存在' },
        { status: 404 }
      )
    }

    const world = await db.worldBuilding.update({
      where: { id: worldId },
      data: {
        title: body.title?.trim(),
        content: body.content,
        type: body.type,
      },
    })

    return NextResponse.json({
      success: true,
      world,
    })

  } catch (error) {
    console.error('更新世界观失败:', error)
    return NextResponse.json(
      {
        error: '更新世界观失败',
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
    const worldId = params.id

    // 检查世界观是否存在且属于当前用户
    const existingWorld = await db.worldBuilding.findFirst({
      where: {
        id: worldId,
        novel: {
          userId: user.id
        }
      }
    })

    if (!existingWorld) {
      return NextResponse.json(
        { error: '世界观设定不存在' },
        { status: 404 }
      )
    }

    await db.worldBuilding.delete({
      where: { id: worldId },
    })

    return NextResponse.json({
      success: true,
      message: '世界观设定已删除',
    })

  } catch (error) {
    console.error('删除世界观失败:', error)
    return NextResponse.json(
      {
        error: '删除世界观失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}