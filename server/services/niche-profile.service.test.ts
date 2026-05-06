import { describe, it, expect, vi, beforeEach } from "vitest"
import { NotFoundError, ConflictError, ValidationError } from "@/server/errors/client.error"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    nicheProfile: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: unknown) => unknown) =>
      cb({
        nicheProfile: { create: vi.fn(), update: vi.fn() },
        user:         { update: vi.fn() },
      }),
    ),
  },
}))

vi.mock("@/server/repositories/niche-profile.repository", () => ({
  nicheProfileRepository: {
    findByDisplayName:  vi.fn(),
    findByUserAndNiche: vi.fn(),
  },
}))

vi.mock("@/server/repositories/niche.repository", () => ({
  nicheRepository: { findBySlug: vi.fn() },
}))

vi.mock("@/server/repositories/listing.repository", () => ({
  listingRepository: { findPublicByNicheAndUser: vi.fn() },
}))

vi.mock("@/server/services/mediable.service", () => ({
  mediableService: { fetchCover: vi.fn() },
}))

vi.mock("@/server/mappers/niche-profile.mapper", () => ({
  NicheProfileMapper: { toPublic: vi.fn() },
}))

vi.mock("@/server/mappers/listing.mapper", () => ({
  ListingMapper: { toSummary: vi.fn() },
}))

import { nicheProfileService } from "./niche-profile.service"
import { nicheProfileRepository } from "@/server/repositories/niche-profile.repository"
import { nicheRepository } from "@/server/repositories/niche.repository"
import { listingRepository } from "@/server/repositories/listing.repository"
import { mediableService } from "@/server/services/mediable.service"
import { NicheProfileMapper } from "@/server/mappers/niche-profile.mapper"
import { ListingMapper } from "@/server/mappers/listing.mapper"
import { prisma } from "@/lib/prisma"

const NICHE_ID     = "550e8400-e29b-41d4-a716-446655440001"
const USER_ID      = "550e8400-e29b-41d4-a716-446655440002"
const PROFILE_ID   = "550e8400-e29b-41d4-a716-446655440003"
const NICHE_SLUG   = "tech"
const DISPLAY_NAME = "johndoe"

const mockProfile = {
  id:           PROFILE_ID,
  user_id:      USER_ID,
  niche_id:     NICHE_ID,
  display_name: DISPLAY_NAME,
  bio:          "Hello world",
  created_at:   new Date("2026-01-01"),
  updated_at:   new Date("2026-01-01"),
  user: {
    id: USER_ID, first_name: "John", last_name: "Doe",
    email: "john@example.com", phone: null, bio: null,
    code: "ABC123", role: "member", location: null, location_id: null,
    email_verified_at: null, code_updated_at: null, banned_at: null,
    created_at: new Date("2026-01-01"), updated_at: new Date("2026-01-01"),
  },
  niche: { id: NICHE_ID, title: "Tech", slug: NICHE_SLUG, description: null, order: 1, created_at: new Date(), updated_at: new Date() },
}

const mockPublicProfile = {
  display_name: DISPLAY_NAME,
  bio: "Hello world",
  user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone: null, bio: null, code: "ABC123", role: "member", location: null, cover: null },
  niche: { title: "Tech", slug: NICHE_SLUG, description: null },
  listings: { items: [], total: 0, page: 1, limit: 20 },
}

describe("NicheProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getByDisplayName", () => {
    it("throws NotFoundError when profile does not exist", async () => {
      vi.mocked(nicheProfileRepository.findByDisplayName).mockResolvedValue(null)
      await expect(nicheProfileService.getByDisplayName(NICHE_SLUG, "unknown", 1, 20)).rejects.toThrow(NotFoundError)
    })

    it("returns mapped public profile when found", async () => {
      vi.mocked(nicheProfileRepository.findByDisplayName).mockResolvedValue(mockProfile as never)
      vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
      vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
      vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

      const result = await nicheProfileService.getByDisplayName(NICHE_SLUG, DISPLAY_NAME, 1, 20)

      expect(nicheProfileRepository.findByDisplayName).toHaveBeenCalledWith(NICHE_SLUG, DISPLAY_NAME)
      expect(mediableService.fetchCover).toHaveBeenCalledWith("user", USER_ID)
      expect(listingRepository.findPublicByNicheAndUser).toHaveBeenCalledWith(USER_ID, NICHE_ID, 1, 20)
      expect(result).toEqual(mockPublicProfile)
    })

    it("maps listing covers for each listing", async () => {
      const mockListing = { id: "listing-id", title: "A Listing" } as unknown as import("@/server/models/listing.model").ListingWithRelations
      const mockCover   = { id: "media-id" } as never
      const mockSummary = { title: "A Listing", slug: "a-listing" } as never

      vi.mocked(nicheProfileRepository.findByDisplayName).mockResolvedValue(mockProfile as never)
      vi.mocked(mediableService.fetchCover).mockResolvedValueOnce(null).mockResolvedValueOnce(mockCover)
      vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [mockListing], total: 1 })
      vi.mocked(ListingMapper.toSummary).mockReturnValue(mockSummary)
      vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

      await nicheProfileService.getByDisplayName(NICHE_SLUG, DISPLAY_NAME, 1, 20)

      expect(mediableService.fetchCover).toHaveBeenCalledWith("listing", "listing-id")
      expect(ListingMapper.toSummary).toHaveBeenCalledWith({ ...mockListing, cover: mockCover })
    })
  })

  describe("update (upsert)", () => {
    const mockNiche = { id: NICHE_ID, title: "Tech", slug: NICHE_SLUG }

    const setupSuccessfulFetch = () => {
      vi.mocked(nicheProfileRepository.findByUserAndNiche).mockResolvedValue(mockProfile as never)
      vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
      vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
      vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)
    }

    describe("CREATE path (no existing profile)", () => {
      it("throws ValidationError when display_name is missing", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche).mockResolvedValue(null)
        await expect(
          nicheProfileService.update(NICHE_SLUG, USER_ID, { first_name: "Jane" }),
        ).rejects.toThrow(ValidationError)
      })

      it("throws NotFoundError when niche does not exist", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche).mockResolvedValue(null)
        vi.mocked(nicheRepository.findBySlug).mockResolvedValue(null)
        await expect(
          nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "newuser" }),
        ).rejects.toThrow(NotFoundError)
      })

      it("throws ConflictError when display_name is already taken", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche).mockResolvedValue(null)
        vi.mocked(nicheRepository.findBySlug).mockResolvedValue(mockNiche as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue({ id: "other-id" } as never)
        await expect(
          nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "taken" }),
        ).rejects.toThrow(ConflictError)
      })

      it("creates profile and returns public result", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockProfile as never)
        vi.mocked(nicheRepository.findBySlug).mockResolvedValue(mockNiche as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue(null)
        vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
        vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
        vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

        const result = await nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "newuser" })
        expect(result).toEqual(mockPublicProfile)
      })

      it("normalizes display_name to lowercase on creation", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockProfile as never)
        vi.mocked(nicheRepository.findBySlug).mockResolvedValue(mockNiche as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue(null)
        vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
        vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
        vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

        await nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "NewUser" })

        expect(prisma.nicheProfile.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: expect.objectContaining({ display_name: "newuser" }) }),
        )
      })
    })

    describe("UPDATE path (profile already exists)", () => {
      it("throws ConflictError when new display_name is taken by another profile", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche).mockResolvedValue(mockProfile as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue({ id: "other-id" } as never)
        await expect(
          nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "othername" }),
        ).rejects.toThrow(ConflictError)
      })

      it("skips conflict check when display_name is unchanged", async () => {
        setupSuccessfulFetch()
        await nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: DISPLAY_NAME })
        expect(prisma.nicheProfile.findFirst).not.toHaveBeenCalled()
      })

      it("normalizes display_name to lowercase before conflict check", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche)
          .mockResolvedValueOnce(mockProfile as never)
          .mockResolvedValueOnce(mockProfile as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue(null)
        vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
        vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
        vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

        await nicheProfileService.update(NICHE_SLUG, USER_ID, { display_name: "NewName" })

        expect(prisma.nicheProfile.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: expect.objectContaining({ display_name: "newname" }) }),
        )
      })

      it("returns updated public profile on success", async () => {
        vi.mocked(nicheProfileRepository.findByUserAndNiche)
          .mockResolvedValueOnce(mockProfile as never)
          .mockResolvedValueOnce(mockProfile as never)
        vi.mocked(prisma.nicheProfile.findFirst).mockResolvedValue(null)
        vi.mocked(mediableService.fetchCover).mockResolvedValue(null)
        vi.mocked(listingRepository.findPublicByNicheAndUser).mockResolvedValue({ items: [], total: 0 })
        vi.mocked(NicheProfileMapper.toPublic).mockReturnValue(mockPublicProfile as never)

        const result = await nicheProfileService.update(NICHE_SLUG, USER_ID, {
          display_name: "new-name",
          first_name:   "Jane",
          phone:        "+54911234",
        })
        expect(result).toEqual(mockPublicProfile)
      })
    })
  })
})
