import { prisma } from "@/lib/prisma"
import { ValidationError } from "@/server/errors/client.error"
import { MediaableEntityService } from "@/server/services/mediable-entity.service"
import { listingRepository } from "@/server/repositories/listing.repository"
import { mediableService } from "@/server/services/mediable.service"
import { ListingMapper } from "@/server/mappers/listing.mapper"
import type { PaginatedResult } from "@/server/types/pagination"
import type {
  ListingWithRelations,
  ListingPublic,
  ListingSummary,
  CreateListingInput,
  UpdateListingInput,
  AttributeValueInput,
  SpecificationValueInput,
} from "@/server/models/listing.model"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"

const withRelations = {
  include: {
    niche: true,
    user: true,
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

class ListingService extends MediaableEntityService<ListingWithRelations, ListingPublic, CreateListingInput, UpdateListingInput> {
  constructor() {
    super(listingRepository, ListingMapper, "listing", "Listing")
  }

  protected override canView(listing: ListingWithRelations, userId: string | null): boolean {
    return !listing.is_draft || listing.user_id === userId
  }

  async getAll(userId: string, page = 1, limit = 20, nicheId?: string): Promise<PaginatedResult<ListingSummary>> {
    const { items, total } = await listingRepository.findAllByUser(userId, page, limit, nicheId)
    const summaries = await Promise.all(
      items.map(async (listing) => {
        const cover = await mediableService.fetchCover("listing", listing.id)
        return ListingMapper.toSummary({ ...listing, cover })
      }),
    )
    return { items: summaries, total, page, limit }
  }

  async create(input: CreateListingInput): Promise<ListingPublic> {
    const { status_ids, attributes, specifications, images, ...listingData } = input
    const slug = await this.generateUniqueSlug(input.title)

    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({ data: { ...listingData, slug } })

      if (status_ids?.length) {
        await this.syncStatuses(tx, created.id, status_ids)
      }
      if (attributes?.length) {
        await this.syncAttributes(tx, created.id, attributes)
      }
      if (specifications?.length) {
        await this.syncSpecifications(tx, created.id, specifications)
      }
      await this.recomputeCategoryBitmask(tx, created.id, created.category_id)

      return tx.listing.findUniqueOrThrow({ where: { id: created.id }, ...withRelations })
    }) as ListingWithRelations

    if (images?.length) {
      await mediableService.appendImages("listing", listing.id, input.user_id, images)
    }

    return this.toPublicWithMedia(listing)
  }

  async update(slug: string, input: UpdateListingInput, userId: string): Promise<ListingPublic> {
    const existing = await listingRepository.findBySlugForUser(slug, userId)
    if (!existing) throw new ValidationError("Listing not found")

    const { status_ids, attributes, specifications, images, ...listingData } = input

    // TODO: allow to change slug
    const newSlug = existing.slug
    /*if (listingData.title && listingData.title !== existing.title) {
      newSlug = await this.generateUniqueSlug(listingData.title, existing.id)
    }*/

    const listing = await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id: existing.id },
        data: { ...listingData, slug: newSlug },
      })

      if (status_ids !== undefined) {
        await this.syncStatuses(tx, existing.id, status_ids)
      }
      if (attributes !== undefined) {
        await this.syncAttributes(tx, existing.id, attributes)
      }
      if (specifications !== undefined) {
        await this.syncSpecifications(tx, existing.id, specifications)
      }
      if (listingData.category_id !== undefined) {
        await this.recomputeCategoryBitmask(tx, existing.id, listingData.category_id ?? null)
      }

      return tx.listing.findUniqueOrThrow({ where: { id: existing.id }, ...withRelations })
    }) as ListingWithRelations

    if (images !== undefined) {
      await mediableService.syncImages("listing", existing.id, userId, images)
    }

    return this.toPublicWithMedia(listing)
  }

  async publish(slug: string, userId: string): Promise<ListingPublic> {
    const listing = await listingRepository.findBySlugForUser(slug, userId)
    if (!listing) throw new ValidationError("Listing not found")
    if (!listing.is_draft) throw new ValidationError("Listing is already published")

    if (!listing.title) throw new ValidationError("Title is required to publish")
    if (listing.price === null || listing.price === undefined) {
      throw new ValidationError("Price is required to publish")
    }
    if (!listing.description) throw new ValidationError("Description is required to publish")

    const images = await mediableService.fetchMedia("listing", listing.id)
    if (images.length === 0) throw new ValidationError("At least one image is required to publish")

    const updated = (await prisma.listing.update({
      where: { id: listing.id },
      data: { is_draft: false, published_at: new Date() },
      ...withRelations,
    })) as ListingWithRelations

    return this.toPublicWithMedia(updated)
  }

  private async syncStatuses(
      tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, 
      listingId: string, 
      statuses: string[]
    ): Promise<void> {
      await tx.listingStatus.deleteMany({ where: { listing_id: listingId } })
      if (statuses.length === 0) return
      await tx.listingStatus.createMany({
        data: statuses.map((status_id) => ({ listing_id: listingId, status_id })),
      })
  }

  private async syncAttributes(
    tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
    listingId: string,
    attributes: AttributeValueInput[]
  ): Promise<void> {
    await tx.listingAttribute.deleteMany({ where: { listing_id: listingId } })
    if (attributes.length === 0) return

    const attrs = await prisma.attribute.findMany({ where: { id: { in: attributes.map((a) => a.attribute_id) } } })
    if (attrs.length !== attributes.length) {
      throw new ValidationError("Invalid attributes")
    }
    await tx.listingAttribute.createMany({
      data: attributes.map((a) => ({
        listing_id: listingId,
        attribute_id: a.attribute_id,
        value: attrs.find((attr) => attr.id === a.attribute_id)?.allow_values && a.value ? a.value : null,
      })),
    })
  }

  private async syncSpecifications(
    tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
    listingId: string,
    specifications: SpecificationValueInput[]
  ): Promise<void> {
    await tx.listingSpecificationValue.deleteMany({ where: { listing_id: listingId } })
    if (specifications.length === 0) return

    await tx.listingSpecificationValue.createMany({
      data: specifications.map((s) => ({
        listing_id: listingId,
        specification_id: s.specification_id,
        specification_category_value_id: s.specification_category_value_id ?? null,
        value: s.value ?? null,
      })),
    })

    const specIds = [...new Set(specifications.map((s) => s.specification_id))]
    for (const specificationId of specIds) {
      await this.recomputeSpecBitmask(tx, listingId, specificationId)
    }
  }

  private async recomputeSpecBitmask(
    tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
    listingId: string,
    specificationId: string
  ): Promise<void> {
    const rows = await tx.listingSpecificationValue.findMany({
      where: {
        listing_id: listingId,
        specification_id: specificationId,
        specification_category_value_id: { not: null },
      },
      include: {
        specification_category_value: {
          include: { specification_value: true },
        },
      },
    })

    const hash = rows.reduce((acc, row) => {
      const bitpos = row.specification_category_value?.specification_value?.bitpos
      return bitpos !== undefined ? acc | bitpos : acc
    }, BigInt(0))

    if (hash === BigInt(0)) {
      await tx.listingSpecBitmask.deleteMany({
        where: { listing_id: listingId, specification_id: specificationId },
      })
    } else {
      await tx.listingSpecBitmask.upsert({
        where: { listing_id_specification_id: { listing_id: listingId, specification_id: specificationId } },
        create: { listing_id: listingId, specification_id: specificationId, hash },
        update: { hash },
      })
    }
  }

  private async recomputeCategoryBitmask(
    tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
    listingId: string,
    categoryId: string | null
  ): Promise<void> {
    if (!categoryId) {
      await tx.listingCategoryBitmask.deleteMany({ where: { listing_id: listingId } })
      return
    }
    const rows = await tx.$queryRaw<Array<{ bitpos: bigint }>>(Prisma.sql`
      WITH RECURSIVE ancestors AS (
        SELECT id, parent_id, bitpos FROM categories WHERE id = ${categoryId}::uuid
        UNION ALL
        SELECT c.id, c.parent_id, c.bitpos FROM categories c
        INNER JOIN ancestors a ON c.id = a.parent_id
      )
      SELECT bitpos FROM ancestors
    `)
    const hash = rows.reduce((acc, row) => acc | row.bitpos, BigInt(0))
    await tx.listingCategoryBitmask.upsert({
      where: { listing_id: listingId },
      create: { listing_id: listingId, hash },
      update: { hash },
    })
  }
}

export const listingService = new ListingService()
