import { BaseRepository } from "./base.repository"

export abstract class MediaableEntityRepository<TEntity, TCreate, TUpdate>
  extends BaseRepository<TEntity, TCreate, TUpdate> {

  abstract findAllByUser(userId: string, page: number, limit: number): Promise<{ items: TEntity[]; total: number }>
  abstract findBySlug(slug: string): Promise<TEntity | null>
  abstract findBySlugForUser(slug: string, userId: string): Promise<TEntity | null>
  abstract slugExists(slug: string, excludeId?: string): Promise<boolean>
}
