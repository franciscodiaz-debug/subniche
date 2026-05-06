import { NextRequest, NextResponse } from "next/server"
import type { ZodType } from "zod"
import { ApiBaseController } from "@/server/controllers/api-base.controller"
import { BaseService } from "@/server/services/base.service"
import { requireAdmin } from "@/server/middleware/auth.middleware"
import { Validate, ValidatedRequest } from "@/server/middleware/validate.middleware"

export class AdminBaseController<
  TEntity,
  TCreate,
  TUpdate,
  TResponse = TEntity,
> extends ApiBaseController {
  constructor(
    protected readonly service: BaseService<TEntity, TCreate, TUpdate, TResponse>,
    protected readonly createSchema: ZodType<TCreate>,
    protected readonly updateSchema: ZodType<TUpdate>
  ) {
    super()
  }

  protected async handleAdminResponse<T>(
    req: NextRequest,
    handler: () => Promise<T | null>
  ): Promise<NextResponse> {
    const auth = await requireAdmin(req)
    if (auth instanceof NextResponse) return auth
    return this.handleResponse(handler)
  }

  async getAll(req: NextRequest): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => this.service.getAll())
  }

  async getOne(req: NextRequest, id: string): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => this.service.getById(id))
  }

  @Validate((self) => (self as AdminBaseController<unknown, unknown, unknown>).createSchema)
  async create(req: NextRequest): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => {
      const { validated } = req as ValidatedRequest<TCreate>
      return this.service.create(validated)
    })
  }

  @Validate((self) => (self as AdminBaseController<unknown, unknown, unknown>).updateSchema)
  async update(req: NextRequest, id: string): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => {
      const { validated } = req as ValidatedRequest<TUpdate>
      return this.service.update(id, validated)
    })
  }

  async delete(req: NextRequest, id: string): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => this.service.delete(id))
  }
}
