/**
 * Integration tests for AuthController
 *
 * Strategy: mock authService at the boundary so each test verifies the full
 * controller path — body/query parsing, schema validation, error mapping, and
 * response shape — without touching the database.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ── Mock authService before importing the controller ─────────────────────────

vi.mock("@/server/services/auth.service", () => ({
  authService: {
    initiateRegistration:  vi.fn(),
    verifyEmailToken:      vi.fn(),
    completeRegistration:  vi.fn(),
    login:                 vi.fn(),
  },
}))

import { authController } from "@/server/controllers/auth.controller"
import { authService }    from "@/server/services/auth.service"
import { ValidationError, NotFoundError, ConflictError } from "@/server/errors/client.error"

// ── Helpers ───────────────────────────────────────────────────────────────────

function postRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method:  "POST",
    body:    JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

function getRequest(url: string): NextRequest {
  return new NextRequest(url)
}

async function parseBody(res: Response) {
  return res.json() as Promise<{ data: unknown; error: string | null }>
}

const mockUser = {
  id:                   "user-uuid-1",
  first_name:           "Jane",
  last_name:            "Doe",
  email:                "jane@example.com",
  phone:                null,
  bio:                  null,
  location_id:          null,
  code:            "TEST01",
  code_updated_at: null,
  role:                 "member",
  created_at:           new Date().toISOString(),
  updated_at:           new Date().toISOString(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register/initiate
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register/initiate", () => {
  it("returns 202 with a confirmation message for a valid email", async () => {
    vi.mocked(authService.initiateRegistration).mockResolvedValue({ message: "Verification email sent" })

    const res = await authController.initiateRegistration(
      postRequest("http://localhost/api/auth/register/initiate", { email: "jane@example.com" })
    )

    expect(res.status).toBe(202)
    const body = await parseBody(res)
    expect(body.data).toMatchObject({ message: "Verification email sent" })
    expect(body.error).toBeNull()
  })

  it("returns 422 when body is missing email", async () => {
    const res = await authController.initiateRegistration(
      postRequest("http://localhost/api/auth/register/initiate", {})
    )

    expect(res.status).toBe(422)
    expect(authService.initiateRegistration).not.toHaveBeenCalled()
  })

  it("returns 422 for a malformed email address", async () => {
    const res = await authController.initiateRegistration(
      postRequest("http://localhost/api/auth/register/initiate", { email: "not-an-email" })
    )

    expect(res.status).toBe(422)
  })

  it("returns 409 when the service reports the email is already taken", async () => {
    vi.mocked(authService.initiateRegistration).mockRejectedValue(
      new ValidationError("Email already registered", 409)
    )

    const res = await authController.initiateRegistration(
      postRequest("http://localhost/api/auth/register/initiate", { email: "taken@example.com" })
    )

    expect(res.status).toBe(409)
    const body = await parseBody(res)
    expect(body.error).toBe("Email already registered")
  })

  it("returns 500 on unexpected service errors", async () => {
    vi.mocked(authService.initiateRegistration).mockRejectedValue(new Error("DB connection lost"))

    const res = await authController.initiateRegistration(
      postRequest("http://localhost/api/auth/register/initiate", { email: "jane@example.com" })
    )

    expect(res.status).toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/register/verify
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/auth/register/verify", () => {
  it("returns 200 with the verified email when the token is valid", async () => {
    vi.mocked(authService.verifyEmailToken).mockResolvedValue({ email: "jane@example.com", code: "TEST01" })

    const res = await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify?token=valid-token-abc")
    )

    expect(res.status).toBe(200)
    const body = await parseBody(res)
    expect(body.data).toEqual({ email: "jane@example.com", code: "TEST01" })
    expect(body.error).toBeNull()
  })

  it("returns 422 when the token query param is absent", async () => {
    const res = await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify")
    )

    expect(res.status).toBe(422)
    expect(authService.verifyEmailToken).not.toHaveBeenCalled()
  })

  it("returns 404 when the service cannot find the token", async () => {
    vi.mocked(authService.verifyEmailToken).mockRejectedValue(
      new NotFoundError("Invalid or expired verification token")
    )

    const res = await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify?token=unknown")
    )

    expect(res.status).toBe(404)
    const body = await parseBody(res)
    expect(body.error).toBe("Invalid or expired verification token")
  })

  it("returns 422 when the service reports the token was already used", async () => {
    vi.mocked(authService.verifyEmailToken).mockRejectedValue(
      new ValidationError("Token already used")
    )

    const res = await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify?token=used-token")
    )

    expect(res.status).toBe(422)
  })

  it("returns 422 when the service reports the token has expired", async () => {
    vi.mocked(authService.verifyEmailToken).mockRejectedValue(
      new ValidationError("Verification token has expired")
    )

    const res = await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify?token=expired-token")
    )

    expect(res.status).toBe(422)
  })

  it("passes the raw token string to the service", async () => {
    vi.mocked(authService.verifyEmailToken).mockResolvedValue({ email: "jane@example.com", code: "TEST01" })

    await authController.verifyEmail(
      getRequest("http://localhost/api/auth/register/verify?token=my-raw-token")
    )

    expect(authService.verifyEmailToken).toHaveBeenCalledWith("my-raw-token")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register/complete
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register/complete", () => {
  const validBody = { token: "verified-token", password: "ValidPass1!", user: { code: "TEST01" } }

  it("returns 201 with the created user on success", async () => {
    vi.mocked(authService.completeRegistration).mockResolvedValue(mockUser as never)

    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", validBody)
    )

    expect(res.status).toBe(201)
    const body = await parseBody(res)
    expect(body.data).toMatchObject({ email: "jane@example.com", code: "TEST01" })
    expect(body.error).toBeNull()
  })

  it("returns 422 when token is missing", async () => {
    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", { password: "ValidPass1!" })
    )

    expect(res.status).toBe(422)
    expect(authService.completeRegistration).not.toHaveBeenCalled()
  })

  it("returns 422 when password is missing", async () => {
    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", { token: "some-token" })
    )

    expect(res.status).toBe(422)
  })

  it("returns 422 when password is too short", async () => {
    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", { token: "t", password: "Short" })
    )

    expect(res.status).toBe(422)
  })

  it("returns 404 when token is invalid", async () => {
    vi.mocked(authService.completeRegistration).mockRejectedValue(
      new NotFoundError("Invalid or expired verification token")
    )

    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", validBody)
    )

    expect(res.status).toBe(404)
  })

  it("returns 422 when email has not been verified", async () => {
    vi.mocked(authService.completeRegistration).mockRejectedValue(
      new ValidationError("Email has not been verified yet")
    )

    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", validBody)
    )

    expect(res.status).toBe(422)
  })

  it("returns 409 on Prisma unique constraint violation (P2002)", async () => {
    vi.mocked(authService.completeRegistration).mockRejectedValue(
      Object.assign(new ConflictError("Email or code already registered"), { code: "P2002" })
    )

    const res = await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", validBody)
    )

    expect(res.status).toBe(409)
    const body = await parseBody(res)
    expect(body.error).toBe("Email or code already registered")
  })

  it("forwards optional user data to the service", async () => {
    vi.mocked(authService.completeRegistration).mockResolvedValue(mockUser as never)

    await authController.completeRegistration(
      postRequest("http://localhost/api/auth/register/complete", {
        ...validBody,
        user: { code: "TEST01" },
      })
    )

    expect(authService.completeRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        token:    "verified-token",
        password: "ValidPass1!",
        user:     expect.objectContaining({ code: "TEST01" }),
      })
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const passwordBody = {
    identity: {
      provider:       "auth0",
      identify_name:  "email",
      identify_value: "jane@example.com",
      password:       "ValidPass1!",
    },
  }

  const oauthBody = {
    identity: {
      provider:       "google",
      provider_id:    "google-uid-123",
      identify_name:  "email",
      identify_value: "jane@example.com",
    },
  }

  it("returns 200 with the user on successful password login", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser as never)

    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", passwordBody)
    )

    expect(res.status).toBe(200)
    const body = await parseBody(res)
    expect(body.data).toMatchObject({ email: "jane@example.com" })
    expect(body.error).toBeNull()
  })

  it("returns 200 with the user on successful OAuth login", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser as never)

    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", oauthBody)
    )

    expect(res.status).toBe(200)
  })

  it("returns 422 when identity is missing from body", async () => {
    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", {})
    )

    expect(res.status).toBe(422)
    expect(authService.login).not.toHaveBeenCalled()
  })

  it("returns 422 when identify_value is empty string", async () => {
    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", {
        identity: { ...passwordBody.identity, identify_value: "" },
      })
    )

    expect(res.status).toBe(422)
  })

  it("returns 422 on ValidationError from service (invalid credentials)", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ValidationError("Invalid credentials")
    )

    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", passwordBody)
    )

    // ValidationError.status defaults to 422
    expect(res.status).toBe(422)
    const body = await parseBody(res)
    expect(body.error).toBe("Invalid credentials")
  })

  it("returns 500 on unexpected service errors", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("Unexpected DB error"))

    const res = await authController.login(
      postRequest("http://localhost/api/auth/login", passwordBody)
    )

    expect(res.status).toBe(500)
  })

  it("forwards the full parsed body to the service", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser as never)

    await authController.login(
      postRequest("http://localhost/api/auth/login", passwordBody)
    )

    expect(authService.login).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: expect.objectContaining({
          provider:       "auth0",
          identify_value: "jane@example.com",
        }),
      })
    )
  })
})
