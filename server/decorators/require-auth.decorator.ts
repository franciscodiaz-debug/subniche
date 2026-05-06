import { NextRequest, NextResponse } from "next/server"
import { requireAuth, optionalAuth } from "@/server/middleware/auth.middleware"
import type { AuthenticatedRequest } from "@/server/middleware/auth.middleware"

export type { AuthenticatedRequest }
export type OptionallyAuthenticatedRequest = NextRequest & { auth: { userId: string } | null }

export function RequireAuth(_target: object, _key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  descriptor.value = async function(this: unknown, req: NextRequest, ...args: unknown[]) {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth
    ;(req as AuthenticatedRequest).auth = auth
    return original.call(this, req, ...args)
  }
  return descriptor
}

export function OptionalAuth(_target: object, _key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  descriptor.value = async function(this: unknown, req: NextRequest, ...args: unknown[]) {
    const auth = await optionalAuth(req)
    ;(req as OptionallyAuthenticatedRequest).auth = auth
    return original.call(this, req, ...args)
  }
  return descriptor
}
