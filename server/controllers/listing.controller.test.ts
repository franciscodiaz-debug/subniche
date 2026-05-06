import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { listingController } from "./listing.controller"

vi.mock("@/server/services/listing.service", () => ({
  listingService: {
    getAll: vi.fn(),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/server/middleware/auth.middleware", () => ({
  requireAuth: vi.fn(),
  optionalAuth: vi.fn(),
}))

vi.mock("@/server/repositories/niche.repository", () => ({
  nicheRepository: {
    findBySlug: vi.fn(),
  },
}))

import { listingService } from "@/server/services/listing.service"
import { requireAuth, optionalAuth, AuthenticatedRequest } from "@/server/middleware/auth.middleware"
import { nicheRepository } from "@/server/repositories/niche.repository"
import { Niche } from "@prisma/client"
import { ListingSummary } from "../models/listing.model"
import { PaginatedResult } from "../types/pagination"
import { OptionallyAuthenticatedRequest } from "../decorators/require-auth.decorator"

const LISTING_ID = "550e8400-e29b-41d4-a716-446655440001"
const NICHE_ID   = "550e8400-e29b-41d4-a716-446655440002"
const USER_ID    = "550e8400-e29b-41d4-a716-446655440003"
const NICHE_SLUG = "tech"

const mockNiche = { id: NICHE_ID, title: "Tech", slug: NICHE_SLUG }

const mockListing = {
  id: LISTING_ID,
  title: "Test Listing",
  slug: "test-listing",
  price: 99.99,
  subtitle: null,
  description: "A test listing",
  return_policy: null,
  condition_notes: null,
  is_draft: true,
  published_at: null,
  niche: { id: NICHE_ID, title: "Tech", slug: NICHE_SLUG },
  user: { id: USER_ID, first_name: "John", last_name: "Doe" },
  category: null,
  condition: null,
  statuses: [],
  payments: [],
  logistics: [],
  specification_values: [],
  images: [],
  created_at: new Date("2026-01-01").toISOString(),
  updated_at: new Date("2026-01-01").toISOString(),
}

const makeReq = (url: string, options?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(url, options)

describe("ListingController", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getAll", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      )
      const res = await listingController.getAll(makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing`) as AuthenticatedRequest, NICHE_SLUG)
      expect(res.status).toBe(401)
    })

    it("returns 200 with paginated listings when authenticated", async () => {
      const paginated = { items: [mockListing], total: 1, page: 1, limit: 20 }
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheRepository.findBySlug).mockResolvedValue(mockNiche as Niche)
      vi.mocked(listingService.getAll).mockResolvedValue(paginated as unknown as PaginatedResult<ListingSummary>)
      const res = await listingController.getAll(makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing`) as AuthenticatedRequest, NICHE_SLUG)
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data).toEqual(paginated)
      expect(listingService.getAll).toHaveBeenCalledWith(USER_ID, 1, 20, NICHE_ID)
    })

    it("returns 404 when niche not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheRepository.findBySlug).mockResolvedValue(null)
      const res = await listingController.getAll(makeReq(`http://localhost/api/niche/unknown/listing`) as AuthenticatedRequest, "unknown")
      expect(res.status).toBe(404)
    })
  })

  describe("getBySlug", () => {
    it("returns 200 for published listing without auth", async () => {
      vi.mocked(optionalAuth).mockResolvedValue(null)
      vi.mocked(listingService.getBySlug).mockResolvedValue(mockListing)
      const res = await listingController.getBySlug(makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`) as OptionallyAuthenticatedRequest, NICHE_SLUG, "test-listing")
      await res.json()
      expect(res.status).toBe(200)
      expect(listingService.getBySlug).toHaveBeenCalledWith("test-listing", null)
    })

    it("returns 200 for draft listing when authenticated as owner", async () => {
      vi.mocked(optionalAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(listingService.getBySlug).mockResolvedValue({ ...mockListing, is_draft: true })
      const res = await listingController.getBySlug(makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`) as OptionallyAuthenticatedRequest, NICHE_SLUG, "test-listing")
      await res.json()
      expect(res.status).toBe(200)
      expect(listingService.getBySlug).toHaveBeenCalledWith("test-listing", USER_ID)
    })
  })

  describe("create", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      )
      const req = makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing`, {
        method: "POST",
        body: JSON.stringify({ title: "Test" }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await listingController.create(req as AuthenticatedRequest, NICHE_SLUG)
      expect(res.status).toBe(401)
    })

    it("returns 201 with created listing when authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheRepository.findBySlug).mockResolvedValue(mockNiche as Niche)
      vi.mocked(listingService.create).mockResolvedValue(mockListing)
      const req = makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing`, {
        method: "POST",
        body: JSON.stringify({ title: "Test Listing" }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await listingController.create(req as AuthenticatedRequest, NICHE_SLUG)
      const body = await res.json()
      expect(res.status).toBe(201)
      expect(body.data).toEqual(mockListing)
    })

    it("returns 404 when niche not found", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheRepository.findBySlug).mockResolvedValue(null)
      const req = makeReq(`http://localhost/api/niche/unknown/listing`, {
        method: "POST",
        body: JSON.stringify({ title: "Test" }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await listingController.create(req as AuthenticatedRequest, "unknown")
      expect(res.status).toBe(404)
    })
  })

  describe("update", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      )
      const req = makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await listingController.update(req as AuthenticatedRequest, NICHE_SLUG, "test-listing")
      expect(res.status).toBe(401)
    })

    it("returns 200 with updated listing when authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(listingService.update).mockResolvedValue({ ...mockListing, title: "Updated" })
      const req = makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await listingController.update(req as AuthenticatedRequest, NICHE_SLUG, "test-listing")
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.title).toBe("Updated")
    })
  })

  describe("publish", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      )
      const res = await listingController.publish(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing/publish`, { method: "PATCH" }) as AuthenticatedRequest,
        NICHE_SLUG,
        "test-listing",
      )
      expect(res.status).toBe(401)
    })

    it("returns 200 with published listing when authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(listingService.publish).mockResolvedValue({ ...mockListing, is_draft: false })
      const res = await listingController.publish(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing/publish`, { method: "PATCH" }) as AuthenticatedRequest,
        NICHE_SLUG,
        "test-listing",
      )
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.is_draft).toBe(false)
    })
  })

  describe("delete", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      )
      const res = await listingController.delete(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`, { method: "DELETE" }) as AuthenticatedRequest,
        NICHE_SLUG,
        "test-listing",
      )
      expect(res.status).toBe(401)
    })

    it("returns 200 with null data when deleted", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(listingService.delete).mockResolvedValue(undefined)
      const res = await listingController.delete(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/listing/test-listing`, { method: "DELETE" }) as AuthenticatedRequest,
        NICHE_SLUG,
        "test-listing",
      )
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data).toBeNull()
    })
  })
})
