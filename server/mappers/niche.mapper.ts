import type { Niche } from ".prisma/client"
import type { NichePublic } from "@/server/models/niche.model"

export const NicheMapper = {
  toPublic({ title, slug, description }: Niche): NichePublic {
    return { title, slug, description }
  },
}
