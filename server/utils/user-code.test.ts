import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}))

// ── Imports ───────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma"
import { generateUniqueUserCode } from "@/server/utils/user-code"

// ── Helpers ───────────────────────────────────────────────────────────────────

const findFirst = prisma.user.findFirst as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("generateUniqueUserCode", () => {
  describe("format", () => {
    it("returns a code with a word followed by a 4-digit number", async () => {
      findFirst.mockResolvedValue(null)
      const code = await generateUniqueUserCode()
      expect(code).toMatch(/^[a-z]+\d{4}$/)
    })

    it("never exceeds 15 characters", async () => {
      findFirst.mockResolvedValue(null)
      // Run many times to catch any edge case from the word list
      for (let i = 0; i < 50; i++) {
        const code = await generateUniqueUserCode()
        expect(code.length).toBeLessThanOrEqual(15)
      }
    })

    it("contains only lowercase letters and digits", async () => {
      findFirst.mockResolvedValue(null)
      const code = await generateUniqueUserCode()
      expect(code).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe("number range", () => {
    it("numeric suffix is between 1000 and 9999", async () => {
      findFirst.mockResolvedValue(null)
      for (let i = 0; i < 20; i++) {
        const code = await generateUniqueUserCode()
        const numericPart = parseInt(code.match(/\d+$/)![0], 10)
        expect(numericPart).toBeGreaterThanOrEqual(1000)
        expect(numericPart).toBeLessThanOrEqual(9999)
      }
    })
  })

  describe("uniqueness retry", () => {
    it("retries when the first code already exists and returns a unique one", async () => {
      findFirst
        .mockResolvedValueOnce({ id: "1" }) // first attempt: collision
        .mockResolvedValue(null)            // second attempt: unique

      const code = await generateUniqueUserCode()
      expect(findFirst).toHaveBeenCalledTimes(2)
      expect(code).toMatch(/^[a-z]+\d{4}$/)
    })

    it("retries up to 4 times before succeeding on the 5th attempt", async () => {
      findFirst
        .mockResolvedValueOnce({ id: "1" })
        .mockResolvedValueOnce({ id: "2" })
        .mockResolvedValueOnce({ id: "3" })
        .mockResolvedValueOnce({ id: "4" })
        .mockResolvedValue(null)

      const code = await generateUniqueUserCode()
      expect(findFirst).toHaveBeenCalledTimes(5)
      expect(code).toMatch(/^[a-z]+\d{4}$/)
    })

    it("throws after 5 failed attempts to find a unique code", async () => {
      findFirst.mockResolvedValue({ id: "exists" })

      await expect(generateUniqueUserCode()).rejects.toThrow(
        "Failed to generate a unique code after 5 attempts"
      )
      expect(findFirst).toHaveBeenCalledTimes(5)
    })
  })

  describe("database query", () => {
    it("queries the users table with the generated code", async () => {
      findFirst.mockResolvedValue(null)
      const code = await generateUniqueUserCode()
      expect(findFirst).toHaveBeenCalledWith({ where: { code } })
    })
  })
})
