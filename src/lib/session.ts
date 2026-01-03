// lib/session.ts
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export class AuthError extends Error {
  statusCode = 401
  constructor(message = "Unauthorized", statusCode = 401) {
    super(message)
    this.name = "AuthError"
    this.statusCode = statusCode
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return undefined
  return {
    ...session.user,
    accessToken: session.accessToken,
    isAdmin: session.user.isAdmin,
    isBanned: session.user.isBanned,
  } as { id: string; email: string; name?: string; accessToken?: string; isAdmin?: boolean; isBanned?: boolean }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user || !user.accessToken) {
    throw new AuthError()
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!user.isAdmin) {
    throw new AuthError("Admin access required", 403)
  }
  return user
}