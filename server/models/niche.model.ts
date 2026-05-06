import { z } from "zod"
import type { Niche as PrismaNiche } from ".prisma/client"

export const nichePublicSchema = z.object({
  title:       z.string(),
  slug:        z.string(),
  description: z.string().nullable(),
})

export type NichePublic = z.infer<typeof nichePublicSchema>

export class Niche implements PrismaNiche {
  id: string
  title: string
  slug: string
  description: string | null
  order: number
  created_at: Date
  updated_at: Date

  constructor(data: PrismaNiche) {
    this.id = data.id
    this.title = data.title
    this.slug = data.slug
    this.description = data.description
    this.order = data.order
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateNicheInput = {
  title: string
  slug: string
  description?: string | null
  order: number
}

export type UpdateNicheInput = Partial<CreateNicheInput>
