import { prisma } from "@/lib/prisma"
import { MediaableEntityRepository } from "./mediable-entity.repository"
import type { ListingWithRelations, CreateListingInput, UpdateListingInput } from "@/server/models/listing.model"

const withRelations = {
  include: {
    niche: true,
    user: { include: { location: true } },
    category: true,
    condition: true,
    statuses: { include: { status: true } },
    attributes: { include: { attribute: true } },
    specification_values: {
      include: {
        specification: true,
        specification_category_value: {
          include: { specification_value: true },
        },
      },
    },
  },
} as const

class ListingRepository extends MediaableEntityRepository<ListingWithRelations, CreateListingInput, UpdateListingInput> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(prisma.listing as any, "created_at", "desc")
  }

  override findById(id: string): Promise<ListingWithRelations | null> {
    return prisma.listing.findUnique({
      where: { id },
      ...withRelations,
    }) as Promise<ListingWithRelations | null>
  }

  async findAllByUser(userId: string, page: number, limit: number, nicheId?: string): Promise<{ items: ListingWithRelations[]; total: number }> {
    const skip = (page - 1) * limit
    const where = { user_id: userId, ...(nicheId ? { niche_id: nicheId } : {}) }
    const [items, total] = await Promise.all([
      prisma.listing.findMany({ where, ...withRelations, orderBy: { created_at: "desc" }, skip, take: limit }),
      prisma.listing.count({ where }),
    ])
    return { items: items as ListingWithRelations[], total }
  }

  findBySlug(slug: string): Promise<ListingWithRelations | null> {
    return prisma.listing.findUnique({
      where: { slug },
      ...withRelations,
    }) as Promise<ListingWithRelations | null>
  }

  findBySlugForUser(slug: string, userId: string): Promise<ListingWithRelations | null> {
    return prisma.listing.findFirst({
      where: { slug, user_id: userId },
      ...withRelations,
    }) as Promise<ListingWithRelations | null>
  }

  async findPublicByNicheAndUser(
    userId: string,
    nicheId: string,
    page: number,
    limit: number,
  ): Promise<{ items: ListingWithRelations[]; total: number }> {
    const skip = (page - 1) * limit
    const where = { user_id: userId, niche_id: nicheId, is_draft: false }
    const [items, total] = await Promise.all([
      prisma.listing.findMany({ where, ...withRelations, orderBy: { created_at: "desc" }, skip, take: limit }),
      prisma.listing.count({ where }),
    ])
    return { items: items as ListingWithRelations[], total }
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const result = await prisma.listing.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    return result !== null
  }
}

export const listingRepository = new ListingRepository()
