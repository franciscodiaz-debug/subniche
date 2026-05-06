import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

export const createSpecificationValueSchema = z.object({
  specification_id: z.uuid(),
  value:            z.string().min(1).max(255),
})

export const updateSpecificationValueSchema = createSpecificationValueSchema.partial()

const specificationValueSchema = createSpecificationValueSchema.extend({
  id:         z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("SpecificationValue", specificationValueSchema)
registerSchema("CreateSpecificationValueBody", createSpecificationValueSchema)
registerSchema("UpdateSpecificationValueBody", updateSpecificationValueSchema)

export type CreateSpecificationValueBody = z.infer<typeof createSpecificationValueSchema>
export type UpdateSpecificationValueBody = z.infer<typeof updateSpecificationValueSchema>
