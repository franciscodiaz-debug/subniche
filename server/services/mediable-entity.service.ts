import { NotFoundError } from "@/server/errors/client.error"
import { slugify } from "@/server/utils/slug"
import { mediableService } from "@/server/services/mediable.service"
import type { Media } from ".prisma/client"
import type { MediaableEntityRepository } from "@/server/repositories/mediable-entity.repository"

export abstract class MediaableEntityService<
  TEntity extends { id: string; user_id: string },
  TPublic,
  TCreate,
  TUpdate,
> {
  constructor(
    protected readonly repo: MediaableEntityRepository<TEntity, TCreate, TUpdate>,
    protected readonly mapper: { toPublic(entity: TEntity & { images: Media[] }): TPublic },
    protected readonly mediableType: string,
    protected readonly entityName: string,
  ) {}

  protected async toPublicWithMedia(entity: TEntity): Promise<TPublic> {
    return this.mapper.toPublic(await mediableService.enrich(this.mediableType, entity))
  }

  protected async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title)
    let slug = base
    let counter = 0
    while (await this.repo.slugExists(slug, excludeId)) slug = `${base}-${++counter}`
    return slug
  }

  protected canView(_entity: TEntity, _userId: string | null): boolean {
    return true
  }

  async getBySlug(slug: string, userId: string | null): Promise<TPublic> {
    const entity = await this.repo.findBySlug(slug)
    if (!entity) throw new NotFoundError(`${this.entityName} not found`)
    if (!this.canView(entity, userId)) throw new NotFoundError(`${this.entityName} not found`)
    return this.toPublicWithMedia(entity)
  }

  async delete(slug: string, userId: string): Promise<void> {
    const entity = await this.repo.findBySlugForUser(slug, userId)
    if (!entity) throw new NotFoundError(`${this.entityName} not found`)
    await this.repo.delete(entity.id)
  }
}
