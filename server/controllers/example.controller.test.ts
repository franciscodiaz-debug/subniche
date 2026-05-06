import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { exampleController } from "./example.controller"
import { exampleService } from "@/server/services/example.service"
import { NotFoundError } from "@/server/errors/client.error"

vi.mock("@/server/services/example.service", () => ({
  exampleService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockExample = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Test Example",
  description: "A description",
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
}

// NextResponse.json() serializes Date to ISO string
const serializedExample = {
  ...mockExample,
  created_at: mockExample.created_at.toISOString(),
  updated_at: mockExample.updated_at.toISOString(),
}

function makeRequest(body: unknown, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/example", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// GET /api/example — getAll
// ---------------------------------------------------------------------------
describe("getAll", () => {
  it("returns 200 with list of examples", async () => {
    vi.mocked(exampleService.getAll).mockResolvedValue([mockExample])

    const res = await exampleController.getAll()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: [serializedExample], error: null })
  })

  it("returns 200 with empty array when no examples exist", async () => {
    vi.mocked(exampleService.getAll).mockResolvedValue([])

    const res = await exampleController.getAll()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([])
    expect(body.error).toBeNull()
  })

  it("returns 500 when service throws", async () => {
    vi.mocked(exampleService.getAll).mockRejectedValue(new Error("DB error"))

    const res = await exampleController.getAll()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({ data: null, error: "DB error" })
  })
})

// ---------------------------------------------------------------------------
// GET /api/example/[id] — getOne
// ---------------------------------------------------------------------------
describe("getOne", () => {
  it("returns 200 with the example when found", async () => {
    vi.mocked(exampleService.getById).mockResolvedValue(mockExample)

    const res = await exampleController.getOne(mockExample.id)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: serializedExample, error: null })
  })

  it("returns 404 when example is not found", async () => {
    vi.mocked(exampleService.getById).mockRejectedValue(new NotFoundError("Example not found"))

    const res = await exampleController.getOne("non-existent-id")
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.data).toBeNull()
    expect(body.error).toBe("Example not found")
  })
})

// ---------------------------------------------------------------------------
// POST /api/example — create
// ---------------------------------------------------------------------------
describe("create", () => {
  it("returns 200 with created example on valid body", async () => {
    vi.mocked(exampleService.create).mockResolvedValue(mockExample)

    const req = makeRequest({ title: "Test Example", description: "A description" })
    const res = await exampleController.create(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: serializedExample, error: null })
    expect(exampleService.create).toHaveBeenCalledWith({
      title: "Test Example",
      description: "A description",
    })
  })

  it("returns 422 when title is missing", async () => {
    const req = makeRequest({ description: "No title" })
    const res = await exampleController.create(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
    expect(body.error).toBeTruthy()
    expect(exampleService.create).not.toHaveBeenCalled()
  })

  it("returns 422 when title is empty string", async () => {
    const req = makeRequest({ title: "" })
    const res = await exampleController.create(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
  })

  it("returns 500 when service throws", async () => {
    vi.mocked(exampleService.create).mockRejectedValue(new Error("Insert failed"))

    const req = makeRequest({ title: "Valid Title" })
    const res = await exampleController.create(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Insert failed")
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/example/[id] — update
// ---------------------------------------------------------------------------
describe("update", () => {
  it("returns 200 with updated example on valid body", async () => {
    const updated = { ...mockExample, title: "Updated Title" }
    vi.mocked(exampleService.update).mockResolvedValue(updated)

    const req = makeRequest({ title: "Updated Title" }, "PATCH")
    const res = await exampleController.update(req, mockExample.id)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ data: { ...serializedExample, title: "Updated Title" }, error: null })
    expect(exampleService.update).toHaveBeenCalledWith(mockExample.id, { title: "Updated Title" })
  })

  it("returns 200 when body is empty (all fields optional in partial schema)", async () => {
    vi.mocked(exampleService.update).mockResolvedValue(mockExample)

    const req = makeRequest({}, "PATCH")
    const res = await exampleController.update(req, mockExample.id)

    expect(res.status).toBe(200)
  })

  it("returns 422 when title exceeds max length", async () => {
    const req = makeRequest({ title: "a".repeat(256) }, "PATCH")
    const res = await exampleController.update(req, mockExample.id)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.data).toBeNull()
    expect(exampleService.update).not.toHaveBeenCalled()
  })

  it("returns 500 when service throws (e.g. example not found)", async () => {
    vi.mocked(exampleService.update).mockRejectedValue(new Error("Example not found"))

    const req = makeRequest({ title: "New Title" }, "PATCH")
    const res = await exampleController.update(req, "non-existent-id")
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Example not found")
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/example/[id] — delete
// ---------------------------------------------------------------------------
describe("delete", () => {
  it("returns 200 when example is deleted", async () => {
    vi.mocked(exampleService.delete).mockResolvedValue(mockExample)

    const res = await exampleController.delete(mockExample.id)

    expect(res.status).toBe(200)
    expect(exampleService.delete).toHaveBeenCalledWith(mockExample.id)
  })

  it("returns 500 when service throws (e.g. example not found)", async () => {
    vi.mocked(exampleService.delete).mockRejectedValue(new Error("Example not found"))

    const res = await exampleController.delete("non-existent-id")
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe("Example not found")
  })
})
