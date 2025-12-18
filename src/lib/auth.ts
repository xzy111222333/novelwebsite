// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

// 扩展 NextAuth 类型
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
    avatar?: string | null
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string
  }
}

export const authOptions: NextAuthOptions = {
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
          const user = await db.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          if (!user) {
            throw new Error("用户不存在")
          }

          if (!user.password) {
            throw new Error("密码错误")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("密码错误")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
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
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
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