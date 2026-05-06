import type { ApiResponse } from "@/types/api"

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ res: Response; data: T | null; error: string | null }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }
  const res = await fetch(path, { ...options, headers })
  const json: ApiResponse<T> = await res.json()
  return { res, data: json.data, error: json.error }
}
