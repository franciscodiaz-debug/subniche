import { z } from "zod"
import type {
  Listing as PrismaListing,
  Niche as PrismaNiche,
  Category as PrismaCategory,
  Attribute as PrismaAttribute,
  Status as PrismaStatus,
  ListingStatus as PrismaListingStatus,
  ListingAttribute as PrismaListingAttribute,
  ListingSpecificationValue as PrismaListingSpecificationValue,
  SpecificationCategoryValue as PrismaSpecificationCategoryValue,
  SpecificationValue as PrismaSpecificationValue,
  Specification as PrismaSpecification,
} from ".prisma/client"
import { attributeItemSchema } from "./attribute.model"
import { ImageInput, mediaPublicSchema } from "./media.model"
import { userSummarySchema, UserWithRelations } from "./user.model"
export type { ImageInput } from "./media.model"

export const listingSummarySchema = z.object({
  title: z.string(),
  slug: z.string(),
  price: z.number().nullable(),
  is_draft: z.boolean(),
  niche: z.object({ id: z.uuid(), title: z.string(), slug: z.string() }),
  cover: mediaPublicSchema.nullable(),
  created_at: z.iso.datetime(),
  user: userSummarySchema,
})

export type ListingSummary = z.infer<typeof listingSummarySchema>

type ListingSpecValueWithRelations = PrismaListingSpecificationValue & {
  specification: PrismaSpecification
  specification_category_value: (PrismaSpecificationCategoryValue & {
    specification_value: PrismaSpecificationValue
  }) | null
}

export type ListingWithRelations = PrismaListing & {
  niche: PrismaNiche
  user: UserWithRelations
  category: PrismaCategory | null
  condition: PrismaAttribute | null
  statuses: Array<PrismaListingStatus & { status: PrismaStatus }>
  attributes: Array<PrismaListingAttribute & { attribute: PrismaAttribute }>
  specification_values: ListingSpecValueWithRelations[]
}

const listingAttributeValueSchema = z.object({
  attribute: attributeItemSchema,
  value: z.string().nullable(),
})

const listingSpecificationValueSchema = z.object({
  specification: z.object({ id: z.uuid(), name: z.string(), type: z.string() }),
  specification_category_value: z.object({ id: z.uuid(), value: z.string() }).nullable(),
  value: z.string().nullable(),
})

export const listingPublicSchema = z.object({
  title: z.string(),
  slug: z.string(),
  price: z.number().nullable(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  return_policy: z.string().nullable(),
  condition_notes: z.string().nullable(),
  is_draft: z.boolean(),
  published_at: z.iso.datetime().nullable(),
  niche: z.object({ id: z.uuid(), title: z.string(), slug: z.string() }),
  user: z.object({ id: z.uuid(), first_name: z.string().nullable(), last_name: z.string().nullable() }),
  category: z.object({ id: z.uuid(), title: z.string(), slug: z.string() }).nullable(),
  condition: attributeItemSchema.nullable(),
  statuses: z.array(z.object({ id: z.uuid(), name: z.string(), code: z.string(), icon: z.string() })),
  payments: z.array(listingAttributeValueSchema),
  logistics: z.array(listingAttributeValueSchema),
  specification_values: z.array(listingSpecificationValueSchema),
  images: z.array(mediaPublicSchema),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export type ListingPublic = z.infer<typeof listingPublicSchema>

export type AttributeValueInput = {
  attribute_id: string
  value?: string | null
}

export type SpecificationValueInput = {
  specification_id: string
  specification_category_value_id?: string
  value?: string
}

export type CreateListingInput = {
  niche_id: string
  user_id: string
  title: string
  category_id?: string | null
  condition_id?: string | null
  price?: number | null
  subtitle?: string | null
  description?: string | null
  return_policy?: string | null
  condition_notes?: string | null
  status_ids?: string[]
  attributes?: AttributeValueInput[]
  specifications?: SpecificationValueInput[]
  images?: ImageInput[]
}

export type UpdateListingInput = Partial<Omit<CreateListingInput, "niche_id" | "user_id">> & {
  is_draft?: boolean
  published_at?: Date | null
}
