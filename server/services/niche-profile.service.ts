import { prisma } from "@/lib/prisma"
import { NotFoundError, ConflictError, ValidationError } from "@/server/errors/client.error"
import { nicheProfileRepository } from "@/server/repositories/niche-profile.repository"
import { nicheRepository } from "@/server/repositories/niche.repository"
import { listingRepository } from "@/server/repositories/listing.repository"
import { mediableService } from "@/server/services/mediable.service"
import { NicheProfileMapper } from "@/server/mappers/niche-profile.mapper"
import { ListingMapper } from "@/server/mappers/listing.mapper"
import type { NicheProfilePublic, UpdateNicheProfileInput } from "@/server/models/niche-profile.model"

class NicheProfileService {
  async getByDisplayName(
    nicheSlug: string,
    displayName: string,
    page: number,
    limit: number,
  ): Promise<NicheProfilePublic> {
    const profile = await nicheProfileRepository.findByDisplayName(nicheSlug, displayName)
    if (!profile) throw new NotFoundError("Profile not found")

    const [userCover, { items, total }] = await Promise.all([
      mediableService.fetchCover("user", profile.user_id),
      listingRepository.findPublicByNicheAndUser(profile.user_id, profile.niche_id, page, limit),
    ])

    const listingSummaries = await Promise.all(
      items.map(async (listing) => {
        const cover = await mediableService.fetchCover("listing", listing.id)
        return ListingMapper.toSummary({ ...listing, cover })
      }),
    )

    return NicheProfileMapper.toPublic(profile, userCover, {
      items: listingSummaries,
      total,
      page,
      limit,
    })
  }

  async update(nicheSlug: string, userId: string, input: UpdateNicheProfileInput): Promise<NicheProfilePublic> {
    const existing = await nicheProfileRepository.findByUserAndNiche(userId, nicheSlug)
    const display_name = input.display_name?.toLowerCase()

    if (!existing) {
      if (!display_name) throw new ValidationError("display_name is required to create a profile")

      const niche = await nicheRepository.findBySlug(nicheSlug)
      if (!niche) throw new NotFoundError("Niche not found")

      const taken = await prisma.nicheProfile.findFirst({
        where: { niche_id: niche.id, display_name },
        select: { id: true },
      })
      if (taken) throw new ConflictError("Display name already taken in this niche")

      const userData: Record<string, unknown> = {}
      if (input.first_name !== undefined) userData.first_name = input.first_name
      if (input.last_name  !== undefined) userData.last_name  = input.last_name
      if (input.phone      !== undefined) userData.phone      = input.phone

      await prisma.$transaction(async (tx) => {
        await tx.nicheProfile.create({
          data: { user_id: userId, niche_id: niche.id, display_name, bio: input.bio ?? null },
        })
        if (Object.keys(userData).length > 0)
          await tx.user.update({ where: { id: userId }, data: userData })
      })
    } else {
      if (display_name && display_name !== existing.display_name) {
        const taken = await prisma.nicheProfile.findFirst({
          where: { niche_id: existing.niche_id, display_name, NOT: { id: existing.id } },
          select: { id: true },
        })
        if (taken) throw new ConflictError("Display name already taken in this niche")
      }

      const nicheProfileData: Record<string, unknown> = {}
      if (display_name !== undefined) nicheProfileData.display_name = display_name
      if (input.bio !== undefined)    nicheProfileData.bio = input.bio

      const userData: Record<string, unknown> = {}
      if (input.first_name !== undefined) userData.first_name = input.first_name
      if (input.last_name  !== undefined) userData.last_name  = input.last_name
      if (input.phone      !== undefined) userData.phone      = input.phone

      await prisma.$transaction(async (tx) => {
        if (Object.keys(nicheProfileData).length > 0)
          await tx.nicheProfile.update({ where: { id: existing.id }, data: nicheProfileData })
        if (Object.keys(userData).length > 0)
          await tx.user.update({ where: { id: userId }, data: userData })
      })
    }

    const updated = await nicheProfileRepository.findByUserAndNiche(userId, nicheSlug)
    const [userCover, { items, total }] = await Promise.all([
      mediableService.fetchCover("user", userId),
      listingRepository.findPublicByNicheAndUser(userId, updated!.niche_id, 1, 20),
    ])

    const listingSummaries = await Promise.all(
      items.map(async (listing) => {
        const cover = await mediableService.fetchCover("listing", listing.id)
        return ListingMapper.toSummary({ ...listing, cover })
      }),
    )

    return NicheProfileMapper.toPublic(updated!, userCover, {
      items: listingSummaries,
      total,
      page: 1,
      limit: 20,
    })
  }
}

export const nicheProfileService = new NicheProfileService()
