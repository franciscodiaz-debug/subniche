import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { categoryPublicSchema, categoryWithSpecsPublicSchema } from "@/server/models/category.model"

export const createCategorySchema = z.object({
  title:     z.string().min(1).max(255),
  slug:      z.string().min(1).max(255),
  niche_id:  z.uuid(),
  parent_id: z.uuid().nullable().optional(),
  order:     z.number().int(),
})

export const updateCategorySchema = createCategorySchema.partial()

registerSchema("Category", categoryPublicSchema)
registerSchema("CategoryWithSpecs", categoryWithSpecsPublicSchema)
registerSchema("CreateCategoryBody", createCategorySchema)
registerSchema("UpdateCategoryBody", updateCategorySchema)

export const adminCreateCategorySchema = createCategorySchema.omit({ slug: true }).extend({
  slug: z.string().min(1).max(255).optional(),
})

export type CreateCategoryBody = z.infer<typeof createCategorySchema>
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>
export type AdminCreateCategoryInput = z.infer<typeof adminCreateCategorySchema>
