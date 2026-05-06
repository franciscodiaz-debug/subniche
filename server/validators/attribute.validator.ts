import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { attributeItemSchema } from "@/server/models/attribute.model"

export const createAttributeSchema = z.object({
  type:         z.string().min(1).max(15),
  name:         z.string().min(1).max(45),
  code:         z.string().min(1).max(45),
  allow_values: z.boolean().default(false),
  order:        z.number().int().default(0),
})

export const updateAttributeSchema = createAttributeSchema.partial()

export const attributeSchema = createAttributeSchema.extend({
  id:         z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("Attribute", attributeSchema)
registerSchema("AttributeItem", attributeItemSchema)
registerSchema("CreateAttributeBody", createAttributeSchema)
registerSchema("UpdateAttributeBody", updateAttributeSchema)

export type CreateAttributeBody = z.infer<typeof createAttributeSchema>
export type UpdateAttributeBody = z.infer<typeof updateAttributeSchema>
