import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

export const createSpecificationCategoryValueSchema = z.object({
  category_id:            z.uuid(),
  specification_value_id: z.uuid(),
})

export const updateSpecificationCategoryValueSchema = createSpecificationCategoryValueSchema.partial()

const specificationCategoryValueSchema = createSpecificationCategoryValueSchema.extend({
  id:         z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("SpecificationCategoryValue", specificationCategoryValueSchema)
registerSchema("CreateSpecificationCategoryValueBody", createSpecificationCategoryValueSchema)
registerSchema("UpdateSpecificationCategoryValueBody", updateSpecificationCategoryValueSchema)

export type CreateSpecificationCategoryValueBody = z.infer<typeof createSpecificationCategoryValueSchema>
export type UpdateSpecificationCategoryValueBody = z.infer<typeof updateSpecificationCategoryValueSchema>
