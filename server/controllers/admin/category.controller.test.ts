import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { adminCategoryController } from "./category.controller"

vi.mock("@/server/repositories/category.repository", () => ({
  categoryRepository: {
    findAll:  vi.fn(),
    findById: vi.fn(),
    create:   vi.fn(),
    update:   vi.fn(),
    delete:   vi.fn(),
  },
}))

vi.mock("@/server/middleware/auth.middleware", () => ({
  requireAdmin: vi.fn(),
}))

import { categoryRepository } from "@/server/repositories/category.repository"
import { requireAdmin } from "@/server/middleware/auth.middleware"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const CATEGORY_ID = "550e8400-e29b-41d4-a716-446655440001"
const NICHE_ID    = "550e8400-e29b-41d4-a716-446655440002"
const USER_ID     = "550e8400-e29b-41d4-a716-446655440003"

// Full Prisma entity — bitpos is BigInt and will be serialized as string "1"
const mockEntity = {
  id:         CATEGORY_ID,
  title:      "Cars",
  slug:       "cars",
  niche_id:   NICHE_ID,
  parent_id:  null,
  order:      1,
  bitpos:     BigInt(1),
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-01-01"),
}

// Shape of the response after CategoryAdminMapper removes bitpos
const mockResponse = {
  id:        CATEGORY_ID,
  title:     "Cars",
  slug:      "cars",
  niche_id:  NICHE_ID,
  parent_id: null,
  order:     1,
}

// slug is now optional — not included so auto-generation is tested implicitly
const validCreateBody = {
  title:    "Cars",
  niche_id: NICHE_ID,
  order:    1,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeReq = (body?: unknown, method = "GET") =>
  new NextRequest("http://localhost/api/admin/categories", {
    method,
    ...(body !== undefined
      ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }
      : {}),
  })

const asAdmin     = () => vi.mocked(requireAdmin).mockResolvedValue({ userId: USER_ID })
const asUnauth    = () => vi.mocked(requireAdmin).mockResolvedValue(
  NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
)
const asForbidden = () => vi.mocked(requireAdmin).mockResolvedValue(
  NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
)

beforeEach(() => vi.clearAllMocks())

// ---------------------------------------------------------------------------
// GET /admin/categories — getAll
// ---------------------------------------------------------------------------
describe("getAll", () => {
  it("returns 401 when unauthenticated", async () => {
    asUnauth()
    const res = await adminCategoryController.getAll(makeReq())
    expect(res.status).toBe(401)
    expect(categoryRepository.findAll).not.toHaveBeenCalled()
  })

  it("returns 403 when authenticated as non-admin", async () => {
    asForbidden()
    const res = await adminCategoryController.getAll(makeReq())
    expect(res.status).toBe(403)
    expect(categoryRepository.findAll).not.toHaveBeenCalled()
  })

  it("returns 200 with flat list of categories", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findAll).mockResolvedValue([mockEntity])
    const res  = await adminCategoryController.getAll(makeReq())
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).toMatchObject(mockResponse)
    expect(body.error).toBeNull()
  })

  it("returns 200 with empty array when no categories exist", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findAll).mockResolvedValue([])
    const body = await (await adminCategoryController.getAll(makeReq())).json()
    expect(body.data).toEqual([])
  })

  it("does not expose bitpos in any item", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findAll).mockResolvedValue([mockEntity])
    const body = await (await adminCategoryController.getAll(makeReq())).json()
    expect(body.data[0]).not.toHaveProperty("bitpos")
  })

  it("returns 500 when repository throws", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findAll).mockRejectedValue(new Error("DB error"))
    const res  = await adminCategoryController.getAll(makeReq())
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error).toBe("DB error")
  })
})

// ---------------------------------------------------------------------------
// GET /admin/categories/[id] — getOne
// ---------------------------------------------------------------------------
describe("getOne", () => {
  it("returns 401 when unauthenticated", async () => {
    asUnauth()
    const res = await adminCategoryController.getOne(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(401)
    expect(categoryRepository.findById).not.toHaveBeenCalled()
  })

  it("returns 403 when authenticated as non-admin", async () => {
    asForbidden()
    const res = await adminCategoryController.getOne(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(403)
    expect(categoryRepository.findById).not.toHaveBeenCalled()
  })

  it("returns 200 with the category when found", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    const res  = await adminCategoryController.getOne(makeReq(), CATEGORY_ID)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toMatchObject(mockResponse)
    expect(categoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID)
  })

  it("returns 404 when category does not exist", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(null)
    const res  = await adminCategoryController.getOne(makeReq(), "non-existent-id")
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe("Category not found")
  })

  it("does not expose bitpos in response", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    const body = await (await adminCategoryController.getOne(makeReq(), CATEGORY_ID)).json()
    expect(body.data).not.toHaveProperty("bitpos")
  })

  it("returns 500 when repository throws unexpectedly", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockRejectedValue(new Error("Connection lost"))
    const res = await adminCategoryController.getOne(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// POST /admin/categories — create
// ---------------------------------------------------------------------------
describe("create", () => {
  it("returns 401 when unauthenticated", async () => {
    asUnauth()
    const res = await adminCategoryController.create(makeReq(validCreateBody, "POST"))
    expect(res.status).toBe(401)
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("returns 403 when authenticated as non-admin", async () => {
    asForbidden()
    const res = await adminCategoryController.create(makeReq(validCreateBody, "POST"))
    expect(res.status).toBe(403)
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("returns 200 and auto-generates slug from title when not provided", async () => {
    asAdmin()
    vi.mocked(categoryRepository.create).mockResolvedValue(mockEntity)
    const res  = await adminCategoryController.create(makeReq(validCreateBody, "POST"))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toMatchObject(mockResponse)
    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ ...validCreateBody, slug: "cars" })
    )
  })

  it("uses provided slug when given explicitly", async () => {
    asAdmin()
    vi.mocked(categoryRepository.create).mockResolvedValue(mockEntity)
    const bodyWithSlug = { ...validCreateBody, slug: "custom-cars" }
    await adminCategoryController.create(makeReq(bodyWithSlug, "POST"))
    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "custom-cars" })
    )
  })

  it("accepts optional parent_id", async () => {
    asAdmin()
    vi.mocked(categoryRepository.create).mockResolvedValue(mockEntity)
    const withParent = { ...validCreateBody, parent_id: CATEGORY_ID }
    const res = await adminCategoryController.create(makeReq(withParent, "POST"))
    expect(res.status).toBe(200)
    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ parent_id: CATEGORY_ID })
    )
  })

  it("returns 422 when title is missing", async () => {
    const res  = await adminCategoryController.create(makeReq({ niche_id: NICHE_ID, order: 1 }, "POST"))
    const body = await res.json()
    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("returns 422 when title is empty string", async () => {
    const res = await adminCategoryController.create(makeReq({ ...validCreateBody, title: "" }, "POST"))
    expect(res.status).toBe(422)
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("returns 422 when niche_id is not a valid UUID", async () => {
    const res = await adminCategoryController.create(makeReq({ ...validCreateBody, niche_id: "not-a-uuid" }, "POST"))
    expect(res.status).toBe(422)
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("returns 422 when order is not an integer", async () => {
    const res = await adminCategoryController.create(makeReq({ ...validCreateBody, order: "first" }, "POST"))
    expect(res.status).toBe(422)
    expect(categoryRepository.create).not.toHaveBeenCalled()
  })

  it("does not expose bitpos in response", async () => {
    asAdmin()
    vi.mocked(categoryRepository.create).mockResolvedValue(mockEntity)
    const body = await (await adminCategoryController.create(makeReq(validCreateBody, "POST"))).json()
    expect(body.data).not.toHaveProperty("bitpos")
  })

  it("returns 500 when repository throws", async () => {
    asAdmin()
    vi.mocked(categoryRepository.create).mockRejectedValue(new Error("Insert failed"))
    const res = await adminCategoryController.create(makeReq(validCreateBody, "POST"))
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// PATCH /admin/categories/[id] — update
// ---------------------------------------------------------------------------
describe("update", () => {
  it("returns 401 when unauthenticated", async () => {
    asUnauth()
    const res = await adminCategoryController.update(makeReq({ title: "Updated" }, "PATCH"), CATEGORY_ID)
    expect(res.status).toBe(401)
    expect(categoryRepository.update).not.toHaveBeenCalled()
  })

  it("returns 403 when authenticated as non-admin", async () => {
    asForbidden()
    const res = await adminCategoryController.update(makeReq({ title: "Updated" }, "PATCH"), CATEGORY_ID)
    expect(res.status).toBe(403)
    expect(categoryRepository.update).not.toHaveBeenCalled()
  })

  it("returns 200 with updated category", async () => {
    asAdmin()
    const updatedEntity = { ...mockEntity, title: "Updated Cars" }
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    vi.mocked(categoryRepository.update).mockResolvedValue(updatedEntity)
    const res  = await adminCategoryController.update(makeReq({ title: "Updated Cars" }, "PATCH"), CATEGORY_ID)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.title).toBe("Updated Cars")
    expect(categoryRepository.update).toHaveBeenCalledWith(CATEGORY_ID, { title: "Updated Cars" })
  })

  it("returns 200 when body is empty (all fields optional on update)", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    vi.mocked(categoryRepository.update).mockResolvedValue(mockEntity)
    const res = await adminCategoryController.update(makeReq({}, "PATCH"), CATEGORY_ID)
    expect(res.status).toBe(200)
  })

  it("returns 422 when niche_id is not a valid UUID", async () => {
    const res = await adminCategoryController.update(makeReq({ niche_id: "bad-uuid" }, "PATCH"), CATEGORY_ID)
    expect(res.status).toBe(422)
    expect(categoryRepository.update).not.toHaveBeenCalled()
  })

  it("returns 404 when category does not exist", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(null)
    const res  = await adminCategoryController.update(makeReq({ title: "New" }, "PATCH"), "non-existent-id")
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe("Category not found")
  })

  it("does not expose bitpos in response", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    vi.mocked(categoryRepository.update).mockResolvedValue(mockEntity)
    const body = await (await adminCategoryController.update(makeReq({ title: "Updated" }, "PATCH"), CATEGORY_ID)).json()
    expect(body.data).not.toHaveProperty("bitpos")
  })

  it("returns 500 when repository throws unexpectedly", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockRejectedValue(new Error("Update failed"))
    const res = await adminCategoryController.update(makeReq({ title: "X" }, "PATCH"), CATEGORY_ID)
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// DELETE /admin/categories/[id] — delete
// ---------------------------------------------------------------------------
describe("delete", () => {
  it("returns 401 when unauthenticated", async () => {
    asUnauth()
    const res = await adminCategoryController.delete(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(401)
    expect(categoryRepository.delete).not.toHaveBeenCalled()
  })

  it("returns 403 when authenticated as non-admin", async () => {
    asForbidden()
    const res = await adminCategoryController.delete(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(403)
    expect(categoryRepository.delete).not.toHaveBeenCalled()
  })

  it("returns 200 with deleted category", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(mockEntity)
    vi.mocked(categoryRepository.delete).mockResolvedValue(mockEntity)
    const res  = await adminCategoryController.delete(makeReq(), CATEGORY_ID)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toMatchObject(mockResponse)
    expect(categoryRepository.delete).toHaveBeenCalledWith(CATEGORY_ID)
  })

  it("returns 404 when category does not exist", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockResolvedValue(null)
    const res  = await adminCategoryController.delete(makeReq(), "non-existent-id")
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe("Category not found")
  })

  it("returns 500 when repository throws unexpectedly", async () => {
    asAdmin()
    vi.mocked(categoryRepository.findById).mockRejectedValue(new Error("Delete failed"))
    const res = await adminCategoryController.delete(makeReq(), CATEGORY_ID)
    expect(res.status).toBe(500)
  })
})
