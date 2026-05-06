import type { Media as PrismaMedia } from ".prisma/client"
import type { ListingWithRelations, ListingPublic, ListingSummary } from "@/server/models/listing.model"
import { MediaMapper } from "./media.mapper"
import { UserMapper } from "./user.mapper"
import { AttributeType } from "../types/attributes"

export const ListingMapper = {
  toSummary(listing: ListingWithRelations & { cover: PrismaMedia | null }): ListingSummary {
    return {
      title: listing.title,
      slug: listing.slug,
      price: listing.price !== null && listing.price !== undefined ? Number(listing.price) : null,
      is_draft: listing.is_draft,
      niche: { id: listing.niche.id, title: listing.niche.title, slug: listing.niche.slug },
      cover: listing.cover ? MediaMapper.toPublic(listing.cover) : null,
      created_at: listing.created_at.toISOString(),
      user: UserMapper.toSummary({ ...listing.user, media: null }),
    }
  },

  toPublic(listing: ListingWithRelations & { images: PrismaMedia[] }): ListingPublic {
    return {
      title: listing.title,
      slug: listing.slug,
      price: listing.price !== null && listing.price !== undefined ? Number(listing.price) : null,
      subtitle: listing.subtitle ?? null,
      description: listing.description ?? null,
      return_policy: listing.return_policy ?? null,
      condition_notes: listing.condition_notes ?? null,
      is_draft: listing.is_draft,
      published_at: listing.published_at?.toISOString() ?? null,
      niche: {
        id: listing.niche.id,
        title: listing.niche.title,
        slug: listing.niche.slug,
      },
      user: {
        id: listing.user.id,
        first_name: listing.user.first_name ?? null,
        last_name: listing.user.last_name ?? null,
      },
      category: listing.category
        ? { id: listing.category.id, title: listing.category.title, slug: listing.category.slug }
        : null,
      condition: listing.condition
        ? {
            id: listing.condition.id,
            name: listing.condition.name,
            code: listing.condition.code,
            allow_values: listing.condition.allow_values,
          }
        : null,
      statuses: listing.statuses.map((ls) => ({
        id: ls.status.id,
        name: ls.status.name,
        code: ls.status.code,
        icon: ls.status.icon,
      })),
      payments: listing.attributes
        .filter((la) => la.attribute.type === AttributeType.PAYMENT)
        .map((la) => ({
          attribute: {
            id: la.attribute.id,
            name: la.attribute.name,
            code: la.attribute.code,
            allow_values: la.attribute.allow_values,
          },
          value: la.value ?? null,
        })),
      logistics: listing.attributes
        .filter((la) => la.attribute.type === AttributeType.LOGISTICS)
        .map((la) => ({
          attribute: {
            id: la.attribute.id,
            name: la.attribute.name,
            code: la.attribute.code,
            allow_values: la.attribute.allow_values,
          },
          value: la.value ?? null,
        })),
      specification_values: listing.specification_values.map((sv) => ({
        specification: {
          id: sv.specification.id,
          name: sv.specification.name,
          type: sv.specification.type,
        },
        specification_category_value: sv.specification_category_value
          ? {
              id: sv.specification_category_value.id,
              value: sv.specification_category_value.specification_value.value,
            }
          : null,
        value: sv.specification_category_value ? null : sv.value,
      })),
      images: listing.images.map((m: PrismaMedia) => MediaMapper.toPublic(m)),
      created_at: listing.created_at.toISOString(),
      updated_at: listing.updated_at.toISOString(),
    }
  },
}
