// lib/session.ts
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user as { id: string; email: string; name?: string } | undefined
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("未授权访问")
  }
  
  return user
}