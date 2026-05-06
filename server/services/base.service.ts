import { NotFoundError } from "@/server/errors/client.error"
import { BaseRepository } from "../repositories/base.repository"

export interface EntityMapper<TEntity, TResponse> {
  toPublic(entity: TEntity): TResponse
}

export class BaseService<TEntity, TCreate, TUpdate, TResponse = TEntity> {
  constructor(
    private readonly repo: BaseRepository<TEntity, TCreate, TUpdate>,
    private readonly entityName: string,
    private readonly mapper?: EntityMapper<TEntity, TResponse>
  ) {}

  protected serialize(entity: TEntity): TResponse {
    return this.mapper ? this.mapper.toPublic(entity) : entity as unknown as TResponse
  }

  protected async validateById(id: string): Promise<TEntity> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError(`${this.entityName} not found`)
    return entity
  }

  async getAll(): Promise<TResponse[]> {
    const all = await this.repo.findAll()
    const results: TResponse[] = []
    for(let i=0; i<all.length; i++) {
      results.push(this.serialize(all[i]))
    }
    return results
  }

  async getById(id: string): Promise<TResponse> {
    const entity = await this.validateById(id)
    return this.serialize(entity)
  }

  async create(input: TCreate): Promise<TResponse> {
    const entity = await this.repo.create(input)
    return this.serialize(entity)
  }

  async update(id: string, input: TUpdate): Promise<TResponse> {
    await this.validateById(id)
    const updated = await this.repo.update(id, input)
    return this.serialize(updated)
  }

  async delete(id: string): Promise<TResponse> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError(`${this.entityName} not found`)
    const deleted = await this.repo.delete(id)
    return this.serialize(deleted)
  }
}
