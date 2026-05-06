import { prisma } from "@/lib/prisma"
import type { NicheProfileWithRelations } from "@/server/models/niche-profile.model"

const withRelations = {
  include: {
    user: { include: { location: true } },
    niche: true,
  },
} as const

class NicheProfileRepository {
  findByDisplayName(nicheSlug: string, displayName: string): Promise<NicheProfileWithRelations | null> {
    return prisma.nicheProfile.findFirst({
      where: {
        niche: { slug: nicheSlug },
        display_name: displayName,
      },
      ...withRelations,
    }) as Promise<NicheProfileWithRelations | null>
  }

  findByUserAndNiche(userId: string, nicheSlug: string): Promise<NicheProfileWithRelations | null> {
    return prisma.nicheProfile.findFirst({
      where: {
        user_id: userId,
        niche: { slug: nicheSlug },
      },
      ...withRelations,
    }) as Promise<NicheProfileWithRelations | null>
  }
}

export const nicheProfileRepository = new NicheProfileRepository()
