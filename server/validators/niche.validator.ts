import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { nichePublicSchema } from "@/server/models/niche.model"

export const createNicheSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().max(1000).nullable().optional(),
  order: z.number().int(),
})

export const updateNicheSchema = createNicheSchema.partial()

export const nicheSchema = createNicheSchema.extend({
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("Niche", nichePublicSchema)
registerSchema("CreateNicheBody", createNicheSchema)
registerSchema("UpdateNicheBody", updateNicheSchema)

export const adminCreateNicheSchema = createNicheSchema.omit({ slug: true }).extend({
  slug: z.string().min(1).max(255).optional(),
})

export type CreateNicheBody = z.infer<typeof createNicheSchema>
export type UpdateNicheBody = z.infer<typeof updateNicheSchema>
export type AdminCreateNicheInput = z.infer<typeof adminCreateNicheSchema>
