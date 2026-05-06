import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

export const createSpecificationSchema = z.object({
  niche_id:     z.uuid(),
  name:         z.string().min(1).max(255),
  type:         z.string().min(1).max(15),
  field_config: z.record(z.string(), z.any()).optional(),
  order:        z.number().int().optional(),
})

export const updateSpecificationSchema = createSpecificationSchema.partial()

const specificationSchema = createSpecificationSchema.extend({
  id:         z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("Specification", specificationSchema)
registerSchema("CreateSpecificationBody", createSpecificationSchema)
registerSchema("UpdateSpecificationBody", updateSpecificationSchema)

export type CreateSpecificationBody = z.infer<typeof createSpecificationSchema>
export type UpdateSpecificationBody = z.infer<typeof updateSpecificationSchema>
