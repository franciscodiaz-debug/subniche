import { z } from "zod"
import type { Attribute as PrismaAttribute } from ".prisma/client"

export const attributeItemSchema = z.object({
  id:           z.uuid(),
  name:         z.string(),
  code:         z.string(),
  allow_values: z.boolean(),
})

export type AttributeItem = z.infer<typeof attributeItemSchema>

export type GroupedAttributes = Record<string, AttributeItem[]>

export class Attribute implements PrismaAttribute {
  id: string
  type: string
  name: string
  code: string
  allow_values: boolean
  order: number
  created_at: Date
  updated_at: Date

  constructor(data: PrismaAttribute) {
    this.id = data.id
    this.type = data.type
    this.name = data.name
    this.code = data.code
    this.allow_values = data.allow_values
    this.order = data.order
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateAttributeInput = {
  type: string
  name: string
  code: string
  allow_values?: boolean
  order?: number
}

export type UpdateAttributeInput = Partial<CreateAttributeInput>
