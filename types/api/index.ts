// Shared types for API request bodies and response shapes

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  total: number
  page: number
  pageSize: number
}

export type ApiError = {
  error: string
  statusCode: number
}
