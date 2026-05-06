import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("@/server/services/media.service", () => ({
  mediaService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getByMorphable: vi.fn(),
    upload: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/server/middleware/auth.middleware", () => ({
  requireAuth: vi.fn(),
}))

import { mediaController } from "./media.controller"
import { mediaService } from "@/server/services/media.service"
import { requireAuth } from "@/server/middleware/auth.middleware"
import { NotFoundError } from "@/server/errors/client.error"

const mockMedia = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  user_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  mediable_type: "product",
  mediable_id: "550e8400-e29b-41d4-a716-446655440000",
  file_name: "abc123.jpg",
  mime_type: "image/jpeg",
  disk: "local",
  path: "/media/product/bbbb.../abc123.jpg",
  file_size: 12345,
  order: 0,
  variants: {
    original: "/media/product/bbbb.../abc123.jpg",
    thumbnail: "/media/product/bbbb.../abc123_thumb.jpg",
    resized: "/media/product/bbbb.../abc123_resized.jpg",
  },
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
}

const serialized = {
  ...mockMedia,
  created_at: mockMedia.created_at.toISOString(),
  updated_at: mockMedia.updated_at.toISOString(),
}

function makeRequest(body: unknown, method = "POST", url = "http://localhost/api/media"): NextRequest {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})
/*
// ---------------------------------------------------------------------------
// GET /api/media — getAll
// ---------------------------------------------------------------------------
describe("getAll", () => {
  it("returns 200 with list of media", async () => {
    vi.mocked(mediaService.getAll).mockResolvedValue([mockMedia])

    const res = await mediaController.getAll()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: [serialized], error: null })
  })

  it("returns 200 with empty array when no media exists", async () => {
    vi.mocked(mediaService.getAll).mockResolvedValue([])

    const res = await mediaController.getAll()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([])
  })

  it("returns 500 when service throws", async () => {
    vi.mocked(mediaService.getAll).mockRejectedValue(new Error("DB error"))

    const res = await mediaController.getAll()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("DB error")
  })
})

// ---------------------------------------------------------------------------
// GET /api/media?mediable_type=X&mediable_id=Y — getByMorphable
// ---------------------------------------------------------------------------
describe("getByMorphable", () => {
  it("returns 200 with filtered media list", async () => {
    vi.mocked(mediaService.getByMorphable).mockResolvedValue([mockMedia])

    const req = new NextRequest(
      "http://localhost/api/media?mediable_type=product&mediable_id=550e8400-e29b-41d4-a716-446655440000"
    )
    const res = await mediaController.getByMorphable(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: [serialized], error: null })
    expect(mediaService.getByMorphable).toHaveBeenCalledWith(
      "product",
      "550e8400-e29b-41d4-a716-446655440000"
    )
  })

  it("returns 422 when mediable_type or mediable_id is missing", async () => {
    const req = new NextRequest("http://localhost/api/media?mediable_type=product")
    const res = await mediaController.getByMorphable(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
    expect(mediaService.getByMorphable).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// GET /api/media/[id] — getOne
// ---------------------------------------------------------------------------
describe("getOne", () => {
  it("returns 200 with the media when found", async () => {
    vi.mocked(mediaService.getById).mockResolvedValue(mockMedia)

    const res = await mediaController.getOne(mockMedia.id)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: serialized, error: null })
  })

  it("returns 404 when media is not found", async () => {
    vi.mocked(mediaService.getById).mockRejectedValue(new NotFoundError("Media not found"))

    const res = await mediaController.getOne("non-existent-id")
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe("Media not found")
  })
})
*/
// ---------------------------------------------------------------------------
// POST /api/media — create (upload)
// ---------------------------------------------------------------------------
describe("create", () => {
  const validBody = {
    mediable_type: "product",
    mediable_id: "550e8400-e29b-41d4-a716-446655440000",
    base64: "data:image/jpeg;base64,/9j/abc",
    order: 0,
  }

  it("returns 401 when not authenticated", async () => {
    const { NextResponse } = await import("next/server")
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
    )

    const req = makeRequest(validBody)
    const res = await mediaController.create(req)
    await res.json()

    expect(res.status).toBe(401)
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it("returns 200 with created media on valid body", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })
    vi.mocked(mediaService.upload).mockResolvedValue(mockMedia)

    const req = makeRequest(validBody)
    const res = await mediaController.create(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: serialized, error: null })
    expect(mediaService.upload).toHaveBeenCalledWith({
      user_id: mockMedia.user_id,
      mediable_type: "product",
      mediable_id: "550e8400-e29b-41d4-a716-446655440000",
      base64: "data:image/jpeg;base64,/9j/abc",
      order: 0,
    })
  })

  it("returns 422 when mediable_id is not a valid UUID", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })

    const req = makeRequest({ ...validBody, mediable_id: "not-a-uuid" })
    const res = await mediaController.create(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it("returns 422 when base64 is missing", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })

    const req = makeRequest({ mediable_type: "product", mediable_id: "550e8400-e29b-41d4-a716-446655440000" })
    const res = await mediaController.create(req)
    await res.json()

    expect(res.status).toBe(422)
    expect(mediaService.upload).not.toHaveBeenCalled()
  })

  it("returns 500 when service throws", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })
    vi.mocked(mediaService.upload).mockRejectedValue(new Error("File write failed"))

    const req = makeRequest(validBody)
    const res = await mediaController.create(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("File write failed")
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/media/[id] — delete
// ---------------------------------------------------------------------------
describe("delete", () => {
  it("returns 401 when not authenticated", async () => {
    const { NextResponse } = await import("next/server")
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
    )

    const req = new NextRequest("http://localhost/api/media/some-id", { method: "DELETE" })
    const res = await mediaController.delete(req, mockMedia.id)
    await res.json()

    expect(res.status).toBe(401)
    expect(mediaService.delete).not.toHaveBeenCalled()
  })

  it("returns 200 when media is deleted", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })
    vi.mocked(mediaService.delete).mockResolvedValue(mockMedia)

    const req = new NextRequest("http://localhost/api/media/some-id", { method: "DELETE" })
    const res = await mediaController.delete(req, mockMedia.id)

    expect(res.status).toBe(200)
    expect(mediaService.delete).toHaveBeenCalledWith(mockMedia.id, mockMedia.user_id)
  })

  it("returns 404 when media is not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: mockMedia.user_id })
    vi.mocked(mediaService.delete).mockRejectedValue(new NotFoundError("Media not found"))

    const req = new NextRequest("http://localhost/api/media/some-id", { method: "DELETE" })
    const res = await mediaController.delete(req, "non-existent-id")
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe("Media not found")
  })
})
