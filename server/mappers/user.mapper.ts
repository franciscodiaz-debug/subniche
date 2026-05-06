import type { UserWithRelations, UserPublic, UserSummary } from "@/server/models/user.model"
import { LocationMapper } from "./location.mapper"
import { MediaMapper } from "./media.mapper"
import type { Media as PrismaMedia } from ".prisma/client"

export const UserMapper = {
  toSummary(entity: UserWithRelations & { media: PrismaMedia | null }): UserSummary {
    return {
      first_name: entity.first_name,
      last_name: entity.last_name,
      code: entity.code,
      location: entity.location ? LocationMapper.toPublic(entity.location) : null,
      cover: entity.media ? MediaMapper.toPublic(entity.media) : null,
    }
  },
  toPublic(entity: UserWithRelations & { media: PrismaMedia | null }): UserPublic {
    return {
      first_name: entity.first_name,
      last_name: entity.last_name,
      email: entity.email,
      phone: entity.phone,
      bio: entity.bio,
      code: entity.code,
      role: entity.role,
      location: entity.location ? LocationMapper.toPublic(entity.location) : null,
      cover: entity.media ? MediaMapper.toPublic(entity.media) : null,
    }
  },
}
