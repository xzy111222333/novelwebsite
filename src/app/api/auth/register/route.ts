// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { fastapiFetch } from '@/lib/fastapi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log('注册请求:', { name, email })

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '姓名、邮箱和密码都是必填项' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      )
    }

    const res = await fastapiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "注册失败，请稍后重试" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true, user: data })

  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
