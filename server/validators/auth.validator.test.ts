import { describe, it, expect } from "vitest"
import {
  initiateRegisterBodySchema,
  verifyEmailQuerySchema,
  completeRegisterBodySchema,
  loginBodySchema,
} from "@/server/validators/auth.validator"

// ─────────────────────────────────────────────────────────────────────────────
// initiateRegisterBodySchema
// ─────────────────────────────────────────────────────────────────────────────

describe("initiateRegisterBodySchema", () => {
  it("accepts a valid email", () => {
    const result = initiateRegisterBodySchema.safeParse({ email: "user@example.com" })
    expect(result.success).toBe(true)
  })

  it("rejects a missing email field", () => {
    const result = initiateRegisterBodySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects a malformed email", () => {
    const result = initiateRegisterBodySchema.safeParse({ email: "not-an-email" })
    expect(result.success).toBe(false)
  })

  it("rejects an email exceeding 255 characters", () => {
    const result = initiateRegisterBodySchema.safeParse({
      email: `${"a".repeat(250)}@x.com`,
    })
    expect(result.success).toBe(false)
  })

  it("strips unknown fields", () => {
    const result = initiateRegisterBodySchema.safeParse({
      email: "user@example.com",
      extra: "should-be-stripped",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty("extra")
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// verifyEmailQuerySchema
// ─────────────────────────────────────────────────────────────────────────────

describe("verifyEmailQuerySchema", () => {
  it("accepts a non-empty token", () => {
    const result = verifyEmailQuerySchema.safeParse({ token: "abc123" })
    expect(result.success).toBe(true)
  })

  it("rejects a missing token", () => {
    const result = verifyEmailQuerySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects an empty string token", () => {
    const result = verifyEmailQuerySchema.safeParse({ token: "" })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// completeRegisterBodySchema
// ─────────────────────────────────────────────────────────────────────────────

describe("completeRegisterBodySchema", () => {
  const validBody = { token: "some-token", password: "ValidPass1!", user: { code: "TEST01" } }

  it("accepts a valid token + password", () => {
    const result = completeRegisterBodySchema.safeParse(validBody)
    expect(result.success).toBe(true)
  })

  it("accepts optional user fields alongside token + password", () => {
    const result = completeRegisterBodySchema.safeParse({
      ...validBody,
      user: { first_name: "Jane", last_name: "Doe", code: "TEST01" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects when token is missing", () => {
    const result = completeRegisterBodySchema.safeParse({ password: "ValidPass1!" })
    expect(result.success).toBe(false)
  })

  it("rejects when password is missing", () => {
    const result = completeRegisterBodySchema.safeParse({ token: "some-token" })
    expect(result.success).toBe(false)
  })

  it("rejects a password shorter than 8 characters", () => {
    const result = completeRegisterBodySchema.safeParse({ token: "some-token", password: "Short1" })
    expect(result.success).toBe(false)
  })

  it("rejects a password longer than 128 characters", () => {
    const result = completeRegisterBodySchema.safeParse({
      token:    "some-token",
      password: "A1!".padEnd(130, "x"),
    })
    expect(result.success).toBe(false)
  })

  it("rejects an empty token", () => {
    const result = completeRegisterBodySchema.safeParse({ token: "", password: "ValidPass1!" })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// loginBodySchema
// ─────────────────────────────────────────────────────────────────────────────

describe("loginBodySchema", () => {
  const passwordIdentity = {
    provider:       "auth0",
    identify_name:  "email",
    identify_value: "user@example.com",
    password:       "ValidPass1!",
  }

  const oauthIdentity = {
    provider:       "google",
    provider_id:    "google-uid-123",
    identify_name:  "email",
    identify_value: "user@example.com",
  }

  it("accepts a valid password identity payload", () => {
    const result = loginBodySchema.safeParse({ identity: passwordIdentity })
    expect(result.success).toBe(true)
  })

  it("accepts a valid OAuth identity payload", () => {
    const result = loginBodySchema.safeParse({ identity: oauthIdentity })
    expect(result.success).toBe(true)
  })

  it("accepts optional user data alongside the identity", () => {
    const result = loginBodySchema.safeParse({
      identity: oauthIdentity,
      user: { first_name: "Jane", email: "user@example.com" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects when identity is missing", () => {
    const result = loginBodySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects when identify_value is empty", () => {
    const result = loginBodySchema.safeParse({
      identity: { ...passwordIdentity, identify_value: "" },
    })
    expect(result.success).toBe(false)
  })

  it("rejects when provider is empty", () => {
    const result = loginBodySchema.safeParse({
      identity: { ...passwordIdentity, provider: "" },
    })
    expect(result.success).toBe(false)
  })
})
