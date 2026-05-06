import { NextRequest, NextResponse } from "next/server"
import { BaseService } from "../services/base.service"
import { Validate, ValidatedRequest } from "../middleware/validate.middleware"
import type { ZodType } from "zod"
import { ApiBaseController } from "./api-base.controller"

export class BaseController<TEntity, TCreate, TUpdate, TResponse = TEntity> extends ApiBaseController {
  constructor(
    protected readonly service: BaseService<TEntity, TCreate, TUpdate, TResponse>,
    protected readonly createSchema: ZodType<TCreate>,
    protected readonly updateSchema: ZodType<TUpdate>
  ) {
    super()
  }

  async getAll(): Promise<NextResponse> {
    return this.handleResponse(() => this.service.getAll())
  }

  async getOne(id: string): Promise<NextResponse> {
    return this.handleResponse(() => this.service.getById(id))
  }

  @Validate((self) => (self as BaseController<unknown, unknown, unknown>).createSchema)
  async create(req: NextRequest): Promise<NextResponse> {
    const { validated } = req as ValidatedRequest<TCreate>
    return this.handleResponse(() => this.service.create(validated))
  }

  @Validate((self) => (self as BaseController<unknown, unknown, unknown>).updateSchema)
  async update(req: NextRequest, id: string): Promise<NextResponse> {
    const { validated } = req as ValidatedRequest<TUpdate>
    return this.handleResponse(() => this.service.update(id, validated))
  }

  async delete(id: string): Promise<NextResponse> {
    return this.handleResponse(() => this.service.delete(id))
  }
}
