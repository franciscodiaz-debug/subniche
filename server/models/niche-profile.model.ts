import { z } from "zod"
import type { NicheProfile as PrismaNicheProfile, Niche as PrismaNiche } from ".prisma/client"
import { userPublicSchema, UserWithRelations } from "./user.model"
import { nichePublicSchema } from "./niche.model"
import { listingSummarySchema } from "./listing.model"

export type NicheProfileWithRelations = PrismaNicheProfile & {
  user: UserWithRelations
  niche: PrismaNiche
}

export const nicheProfilePublicSchema = z.object({
  display_name: z.string(),
  bio:          z.string().nullable(),
  user:         userPublicSchema,
  niche:        nichePublicSchema,
  listings: z.object({
    items: z.array(listingSummarySchema),
    total: z.number().int(),
    page:  z.number().int(),
    limit: z.number().int(),
  }),
})

export type NicheProfilePublic = z.infer<typeof nicheProfilePublicSchema>

export type UpdateNicheProfileInput = {
  display_name?: string
  bio?:          string | null
  first_name?:   string | null
  last_name?:    string | null
  phone?:        string | null
}
