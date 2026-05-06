import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { nicheProfileController } from "./niche-profile.controller"

vi.mock("@/server/services/niche-profile.service", () => ({
  nicheProfileService: {
    getByDisplayName: vi.fn(),
    update:           vi.fn(),
  },
}))

vi.mock("@/server/middleware/auth.middleware", () => ({
  requireAuth: vi.fn(),
  optionalAuth: vi.fn(),
}))

import { nicheProfileService } from "@/server/services/niche-profile.service"
import { requireAuth } from "@/server/middleware/auth.middleware"
import type { AuthenticatedRequest } from "@/server/decorators/require-auth.decorator"

const NICHE_SLUG   = "tech"
const DISPLAY_NAME = "johndoe"
const USER_ID      = "550e8400-e29b-41d4-a716-446655440001"

const mockProfile = {
  display_name: DISPLAY_NAME,
  bio: "Hello",
  user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone: null, bio: null, code: "ABC123", role: "member", location: null, cover: null },
  niche: { title: "Tech", slug: NICHE_SLUG, description: null },
  listings: { items: [], total: 0, page: 1, limit: 20 },
}

const makeReq = (url: string, options?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(url, options)

describe("NicheProfileController", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getByDisplayName", () => {
    it("returns 200 with profile when found", async () => {
      vi.mocked(nicheProfileService.getByDisplayName).mockResolvedValue(mockProfile as never)
      const res = await nicheProfileController.getByDisplayName(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user/${DISPLAY_NAME}`),
        NICHE_SLUG,
        DISPLAY_NAME,
      )
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data).toEqual(mockProfile)
      expect(nicheProfileService.getByDisplayName).toHaveBeenCalledWith(NICHE_SLUG, DISPLAY_NAME, 1, 20)
    })

    it("returns 200 with custom pagination params", async () => {
      vi.mocked(nicheProfileService.getByDisplayName).mockResolvedValue(mockProfile as never)
      const res = await nicheProfileController.getByDisplayName(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user/${DISPLAY_NAME}?page=2&limit=10`),
        NICHE_SLUG,
        DISPLAY_NAME,
      )
      expect(res.status).toBe(200)
      expect(nicheProfileService.getByDisplayName).toHaveBeenCalledWith(NICHE_SLUG, DISPLAY_NAME, 2, 10)
    })

    it("returns 404 when profile does not exist", async () => {
      const { NotFoundError } = await import("@/server/errors/client.error")
      vi.mocked(nicheProfileService.getByDisplayName).mockRejectedValue(new NotFoundError("Profile not found"))
      const res = await nicheProfileController.getByDisplayName(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user/unknown`),
        NICHE_SLUG,
        "unknown",
      )
      const body = await res.json()
      expect(res.status).toBe(404)
      expect(body.error).toBe("Profile not found")
    })
  })

  describe("update", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
      const res = await nicheProfileController.update(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user`, {
          method: "PATCH",
          body: JSON.stringify({ first_name: "Jane" }),
          headers: { "Content-Type": "application/json" },
        }) as AuthenticatedRequest,
        NICHE_SLUG,
      )
      expect(res.status).toBe(401)
    })

    it("returns 200 with updated profile when authenticated", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheProfileService.update).mockResolvedValue(mockProfile as never)
      const res = await nicheProfileController.update(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user`, {
          method: "PATCH",
          body: JSON.stringify({ first_name: "Jane", display_name: "new-name" }),
          headers: { "Content-Type": "application/json" },
        }) as AuthenticatedRequest,
        NICHE_SLUG,
      )
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data).toEqual(mockProfile)
      expect(nicheProfileService.update).toHaveBeenCalledWith(
        NICHE_SLUG,
        USER_ID,
        expect.objectContaining({ first_name: "Jane", display_name: "new-name" }),
      )
    })

    it("returns 409 when display_name is taken", async () => {
      const { ConflictError } = await import("@/server/errors/client.error")
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheProfileService.update).mockRejectedValue(new ConflictError("Display name already taken in this niche"))
      const res = await nicheProfileController.update(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user`, {
          method: "PATCH",
          body: JSON.stringify({ display_name: "taken-name" }),
          headers: { "Content-Type": "application/json" },
        }) as AuthenticatedRequest,
        NICHE_SLUG,
      )
      const body = await res.json()
      expect(res.status).toBe(409)
      expect(body.error).toBe("Display name already taken in this niche")
    })

    it("returns 422 when display_name has invalid characters", async () => {
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      const res = await nicheProfileController.update(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user`, {
          method: "PATCH",
          body: JSON.stringify({ display_name: "invalid name!" }),
          headers: { "Content-Type": "application/json" },
        }) as AuthenticatedRequest,
        NICHE_SLUG,
      )
      expect(res.status).toBe(422)
    })

    it("returns 404 when profile not found", async () => {
      const { NotFoundError } = await import("@/server/errors/client.error")
      vi.mocked(requireAuth).mockResolvedValue({ userId: USER_ID })
      vi.mocked(nicheProfileService.update).mockRejectedValue(new NotFoundError("Profile not found"))
      const res = await nicheProfileController.update(
        makeReq(`http://localhost/api/niche/${NICHE_SLUG}/user`, {
          method: "PATCH",
          body: JSON.stringify({ first_name: "Jane" }),
          headers: { "Content-Type": "application/json" },
        }) as AuthenticatedRequest,
        NICHE_SLUG,
      )
      const body = await res.json()
      expect(res.status).toBe(404)
      expect(body.error).toBe("Profile not found")
    })
  })
})
