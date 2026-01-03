// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { fastapiFetch } from "./fastapi"

// 扩展 NextAuth 类型
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
    avatar?: string | null
    accessToken?: string
    isAdmin?: boolean
    isBanned?: boolean
  }

  interface Session {
    user: User
    accessToken?: string
    isAdmin?: boolean
    isBanned?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string
    accessToken?: string
    isAdmin?: boolean
    isBanned?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? "dev-nextauth-secret-change-me" : undefined),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("邮箱和密码不能为空")
        }

        try {
          const form = new URLSearchParams()
          form.set("username", credentials.email.toLowerCase().trim())
          form.set("password", credentials.password)

          const loginRes = await fastapiFetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form,
          })

          if (!loginRes.ok) {
            throw new Error("邮箱或密码错误")
          }

          const loginData = (await loginRes.json()) as { access_token: string }
          const accessToken = loginData.access_token

          const meRes = await fastapiFetch("/auth/me", {
            method: "GET",
            accessToken,
          })
          if (!meRes.ok) {
            throw new Error("登录失败")
          }

          const me = (await meRes.json()) as {
            id: string
            email: string
            name?: string | null
            avatar?: string | null
            is_admin?: boolean
            is_banned?: boolean
          }

          return {
            id: me.id,
            email: me.email,
            name: me.name ?? null,
            avatar: me.avatar ?? null,
            accessToken,
            isAdmin: Boolean(me.is_admin),
            isBanned: Boolean(me.is_banned),
          }
        } catch (error) {
          console.error("认证错误:", error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub
      }
      session.accessToken = token.accessToken
      session.user.isAdmin = token.isAdmin
      session.user.isBanned = token.isBanned
      session.isAdmin = token.isAdmin
      session.isBanned = token.isBanned
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        token.accessToken = (user as any).accessToken
        token.isAdmin = (user as any).isAdmin
        token.isBanned = (user as any).isBanned
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    // 移除 signUp 页面配置，因为 NextAuth 默认不提供注册页面
    error: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
}
