// Utility helpers for building consistent API responses

import { NextResponse } from "next/server"
import type { ApiResponse } from "@/types/api"
import { getLogger } from "./logger"

export function ok<T>(data: T, status = 200): NextResponse {
  getLogger().info("status", status)
  getLogger().info("data", JSON.stringify(data))
  return NextResponse.json<ApiResponse<T>>({ data, error: null }, { status })
}

export function created<T>(data: T): NextResponse {
  return ok(data, 201)
}

export function fail(message: string, status = 500): NextResponse {
  getLogger().info("status", status)
  getLogger().error("message", message)
  return NextResponse.json<ApiResponse<null>>({ data: null, error: message }, { status })
}

export function notFound(message = "Not found"): NextResponse {
  return fail(message, 404)
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return fail(message, 401)
}

export function unprocessable(message: string): NextResponse {
  return fail(message, 422)
}
