import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/server/utils/jwt"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getLogger } from "../utils/logger"

export type AuthenticatedRequest = NextRequest & { auth: { userId: string } }

export async function requireAuth(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const unauthorized = () =>
    NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })

  // Bearer token (Swagger / API clients)
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { sub } = await verifyJwt(authHeader.slice(7))
      return { userId: sub }
    } catch {
      return unauthorized()
    }
  }

  // Cookie session (frontend)
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  if (sessionToken) {
    try {
      const { sub } = await verifyJwt(sessionToken)
      return { userId: sub }
    } catch {
      return unauthorized()
    }
  }

  return unauthorized()
}

export async function requireAdmin(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const auth = await requireAuth(req)
  getLogger().debug("auth", JSON.stringify(auth))
  if (auth instanceof NextResponse) return auth

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { role: true } })
  getLogger().debug("user", JSON.stringify(user))
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
  }

  return auth
}

export async function optionalAuth(req: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { sub } = await verifyJwt(authHeader.slice(7))
      return { userId: sub }
    } catch (err) {
      console.error("[optionalAuth] Bearer token rejected:", err)
      return null
    }
  }

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  if (sessionToken) {
    try {
      const { sub } = await verifyJwt(sessionToken)
      return { userId: sub }
    } catch (err) {
      console.error("[optionalAuth] Cookie token rejected:", err)
      return null
    }
  }

  return null
}
