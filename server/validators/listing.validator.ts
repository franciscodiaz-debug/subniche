import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { listingPublicSchema, listingSummarySchema } from "@/server/models/listing.model"

const attributeValueBodySchema = z.object({
  attribute_id: z.uuid(),
  value: z.string().max(255).nullable().optional(),
})

const specificationValueBodySchema = z
  .object({
    specification_id: z.uuid(),
    specification_category_value_id: z.uuid().optional(),
    value: z.string().min(1).max(255).optional(),
  })
  .refine(
    (d) => (d.specification_category_value_id !== undefined) !== (d.value !== undefined),
    { message: "Provide either specification_category_value_id or value, not both or neither" },
  )

const imageBodySchema = z
  .object({
    id: z.uuid().optional(),
    base64: z.string().min(1).optional(),
    order: z.number().int().min(0),
  })
  .refine((d) => d.id !== undefined || d.base64 !== undefined, {
    message: "Either id (existing image) or base64 (new image) must be provided",
  })

export const createListingSchema = z.object({
  title: z.string().min(1).max(255),
  category_id: z.uuid().nullable().optional(),
  condition_id: z.uuid().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  subtitle: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  return_policy: z.string().nullable().optional(),
  condition_notes: z.string().nullable().optional(),
  status_ids: z.array(z.uuid()).optional(),
  attributes: z.array(attributeValueBodySchema).optional(),
  specifications: z.array(specificationValueBodySchema).optional(),
  images: z.array(imageBodySchema).optional(),
})

export const updateListingSchema = createListingSchema.partial()

export const listingSchema = listingPublicSchema

export type CreateListingBody = z.infer<typeof createListingSchema>
export type UpdateListingBody = z.infer<typeof updateListingSchema>

registerSchema("Listing", listingSchema)
registerSchema("ListingSummary", listingSummarySchema)
registerSchema("CreateListingBody", createListingSchema)
registerSchema("UpdateListingBody", updateListingSchema)
