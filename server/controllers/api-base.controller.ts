import { NextResponse } from "next/server"
import type { ApiResponse } from "@/types/api"
import { BaseError } from "../errors/base.error"
import { getLogger } from "../utils/logger"

export class ApiBaseController {
  async handleResponse<T>(callback: () => Promise<T | null>, successStatus: number = 200): Promise<NextResponse<ApiResponse<T | null>>> {
    try {
      const data = await callback()
      getLogger().info("data", JSON.stringify(data))
      getLogger().info("status", successStatus)
      return NextResponse.json<ApiResponse<typeof data>>({ data, error: null }, { status: successStatus })
    } catch (err) {
      const status = err instanceof BaseError ? err.status : 500
      getLogger().info("status", status)
      getLogger().error("error", (err as Error).message)
      return NextResponse.json<ApiResponse<null>>({ data: null, error: (err as Error).message }, { status })
    }
  }
}
