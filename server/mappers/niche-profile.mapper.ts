import type { Media as PrismaMedia } from ".prisma/client"
import type { NicheProfileWithRelations, NicheProfilePublic } from "@/server/models/niche-profile.model"
import type { PaginatedResult } from "@/server/types/pagination"
import type { ListingSummary } from "@/server/models/listing.model"
import { UserMapper } from "./user.mapper"
import { NicheMapper } from "./niche.mapper"

export const NicheProfileMapper = {
  toPublic(
    profile: NicheProfileWithRelations,
    userCover: PrismaMedia | null,
    listings: PaginatedResult<ListingSummary>,
  ): NicheProfilePublic {
    return {
      display_name: profile.display_name,
      bio:          profile.bio ?? null,
      user:         UserMapper.toPublic({ ...profile.user, media: userCover }),
      niche:        NicheMapper.toPublic(profile.niche),
      listings,
    }
  },
}
