import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { nicheProfilePublicSchema } from "@/server/models/niche-profile.model"

export const updateNicheProfileSchema = z.object({
  display_name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers and hyphens allowed").optional(),
  bio:          z.string().max(1000).nullable().optional(),
  first_name:   z.string().max(100).nullable().optional(),
  last_name:    z.string().max(100).nullable().optional(),
  phone:        z.string().max(50).nullable().optional(),
})

export type UpdateNicheProfileBody = z.infer<typeof updateNicheProfileSchema>

registerSchema("NicheProfile", nicheProfilePublicSchema)
registerSchema("UpdateNicheProfileBody", updateNicheProfileSchema)
