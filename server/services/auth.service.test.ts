import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { scrypt, randomBytes } from "crypto"
import { promisify } from "util"

// ── Mocks (hoisted automatically by Vitest before imports) ────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user:                    { findFirst: vi.fn(), create: vi.fn() },
    userIdentity:            { findFirst: vi.fn() },
    emailVerificationToken:  { delete: vi.fn() },
    $transaction:            vi.fn(),
  },
}))

vi.mock("@/server/repositories/auth.repository", () => ({
  authRepository: {
    findUserByEmail:        vi.fn(),
    findUserByCode:         vi.fn(),
    findIdentityByEmail:    vi.fn(),
    findIdentityWithUser:   vi.fn(),
    completeRegistration:   vi.fn(),
    findOrCreateOAuthUser:  vi.fn(),
  },
}))

vi.mock("@/server/repositories/email-verification-token.repository", () => ({
  emailVerificationTokenRepository: {
    deleteByEmail:   vi.fn(),
    create:          vi.fn(),
    findByTokenHash: vi.fn(),
    update:          vi.fn(),
  },
}))

vi.mock("@/server/utils/user-code", () => ({
  generateUniqueUserCode: vi.fn().mockResolvedValue("TEST01"),
}))

vi.mock("@/server/utils/jwt", () => ({
  signJwt: vi.fn().mockResolvedValue("mock-jwt-token"),
}))

// ── Now import (they receive the mocked versions) ─────────────────────────────

import { authRepository } from "@/server/repositories/auth.repository"
import { emailVerificationTokenRepository } from "@/server/repositories/email-verification-token.repository"
import { authService } from "@/server/services/auth.service"
import { ValidationError, NotFoundError } from "@/server/errors/client.error"
import { signJwt } from "@/server/utils/jwt"

// ── Shared fixtures ───────────────────────────────────────────────────────────

const FUTURE = new Date(Date.now() + 15 * 60 * 1000)
const PAST   = new Date(Date.now() - 60 * 1000)

const mockUser = {
  id:                "user-uuid-1",
  first_name:        "Jane",
  last_name:         "Doe",
  email:             "jane@example.com",
  email_verified_at: null,
  phone:             null,
  bio:               null,
  location_id:       null,
  location:          null,
  code:              "TEST01",
  code_updated_at:   null,
  role:              "member" as const,
  banned_at:         null,
  created_at:        new Date(),
  updated_at:        new Date(),
}

const pendingToken = {
  id:             "token-uuid-1",
  email:          "jane@example.com",
  token_hash:     "sha256-of-raw-token",
  suggested_code: "TEST01",
  expires_at:     FUTURE,
  verified_at:    null,
  created_at:     new Date(),
}

const verifiedToken = { ...pendingToken, verified_at: new Date() }
const expiredToken  = { ...pendingToken, expires_at: PAST }

let validPasswordHash: string
const VALID_PASSWORD = "ValidPass1!"

beforeAll(async () => {
  const scryptAsync = promisify(scrypt)
  const salt = randomBytes(16).toString("hex")
  const derived = (await scryptAsync(VALID_PASSWORD, salt, 64)) as Buffer
  validPasswordHash = `${salt}:${derived.toString("hex")}`
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// initiateRegistration
// ─────────────────────────────────────────────────────────────────────────────

describe("AuthService.initiateRegistration", () => {
  it("creates a token and sends email when the address is not registered", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(emailVerificationTokenRepository.deleteByEmail).mockResolvedValue(undefined)
    vi.mocked(emailVerificationTokenRepository.create).mockResolvedValue(pendingToken)

    await expect(
      authService.initiateRegistration({ email: "jane@example.com" }, "http://localhost:3000")
    ).resolves.toEqual({ message: "Verification email sent" })

    expect(emailVerificationTokenRepository.deleteByEmail).toHaveBeenCalledWith("jane@example.com")
    expect(emailVerificationTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email:      "jane@example.com",
        token_hash: expect.any(String),
        expires_at: expect.any(Date),
      })
    )
  })

  it("invalidates any previous pending token before creating a new one", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(emailVerificationTokenRepository.deleteByEmail).mockResolvedValue(undefined)
    vi.mocked(emailVerificationTokenRepository.create).mockResolvedValue(pendingToken)

    await authService.initiateRegistration({ email: "jane@example.com" }, "http://localhost")

    const deleteOrder = vi.mocked(emailVerificationTokenRepository.deleteByEmail).mock.invocationCallOrder[0]
    const createOrder = vi.mocked(emailVerificationTokenRepository.create).mock.invocationCallOrder[0]
    expect(deleteOrder).toBeLessThan(createOrder)
  })

  it("throws ValidationError when the email is already registered", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser)

    await expect(
      authService.initiateRegistration({ email: "jane@example.com" }, "http://localhost")
    ).rejects.toThrow(ValidationError)

    expect(emailVerificationTokenRepository.create).not.toHaveBeenCalled()
  })

  it("sends verification email when an email service is configured", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(emailVerificationTokenRepository.deleteByEmail).mockResolvedValue(undefined)
    vi.mocked(emailVerificationTokenRepository.create).mockResolvedValue(pendingToken)

    const mockEmailService = { send: vi.fn(), sendVerificationEmail: vi.fn().mockResolvedValue(undefined) }
    authService.setEmailService(mockEmailService as never)

    await authService.initiateRegistration({ email: "jane@example.com" }, "http://localhost")

    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      "jane@example.com",
      expect.any(String),
      "http://localhost"
    )

    authService.setEmailService(null as never)
  })

  it("does NOT throw when no email service is configured (dev mode)", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(emailVerificationTokenRepository.deleteByEmail).mockResolvedValue(undefined)
    vi.mocked(emailVerificationTokenRepository.create).mockResolvedValue(pendingToken)

    await expect(
      authService.initiateRegistration({ email: "jane@example.com" }, "http://localhost")
    ).resolves.toEqual({ message: "Verification email sent" })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// verifyEmailToken
// ─────────────────────────────────────────────────────────────────────────────

describe("AuthService.verifyEmailToken", () => {
  it("gets the token and returns the email and code", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(pendingToken)

    const result = await authService.verifyEmailToken("raw-token-value")

    expect(result).toEqual({ email: "jane@example.com", code: "TEST01" })
  })

  it("throws NotFoundError for an unknown token", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(null)

    await expect(authService.verifyEmailToken("unknown-token")).rejects.toThrow(NotFoundError)
  })

  it("throws ValidationError if the token was already used", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(verifiedToken)

    await expect(authService.verifyEmailToken("raw-token-value")).rejects.toThrow(
      expect.objectContaining({ message: "Token already used" })
    )
  })

  it("throws ValidationError if the token has expired", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue({
      ...pendingToken,
      expires_at: PAST,
    })

    await expect(authService.verifyEmailToken("raw-token-value")).rejects.toThrow(
      expect.objectContaining({ message: "Verification token has expired" })
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// completeRegistration
// ─────────────────────────────────────────────────────────────────────────────

describe("AuthService.completeRegistration", () => {
  it("calls authRepository.completeRegistration and returns safe user", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(pendingToken)
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.findUserByCode).mockResolvedValue(null)
    vi.mocked(authRepository.findIdentityByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.completeRegistration).mockResolvedValue({
      ...mockUser,
      email_verified_at: new Date(),
    })

    const result = await authService.completeRegistration({
      token:    "raw-token",
      password: "ValidPass1!",
      user:     { code: "TEST01" },
    })

    expect(authRepository.completeRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenId:       pendingToken.id,
        email:         "jane@example.com",
        userData:      { code: "TEST01" },
        password_hash: expect.any(String),
      })
    )

    expect(result).not.toHaveProperty("email_verified_at")
    expect(result).not.toHaveProperty("banned_at")
  })

  it("throws NotFoundError for an invalid token", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(null)

    await expect(
      authService.completeRegistration({ token: "bad-token", password: "ValidPass1!", user: { code: "TEST01" } })
    ).rejects.toThrow(NotFoundError)
  })

  it("throws ValidationError when the token has expired", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(expiredToken)

    await expect(
      authService.completeRegistration({ token: "raw-token", password: "ValidPass1!", user: { code: "TEST01" } })
    ).rejects.toThrow(expect.objectContaining({ message: "Verification token has expired" }))
  })

  it("throws ValidationError when the email is already registered", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(pendingToken)
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUser)

    await expect(
      authService.completeRegistration({ token: "raw-token", password: "ValidPass1!", user: { code: "TEST01" } })
    ).rejects.toThrow(expect.objectContaining({ message: "Email already registered" }))
  })

  it("throws ValidationError when the identity already exists", async () => {
    vi.mocked(emailVerificationTokenRepository.findByTokenHash).mockResolvedValue(pendingToken)
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.findUserByCode).mockResolvedValue(null)
    vi.mocked(authRepository.findIdentityByEmail).mockResolvedValue({ id: "existing-identity" } as never)

    await expect(
      authService.completeRegistration({ token: "raw-token", password: "ValidPass1!", user: { code: "TEST01" } })
    ).rejects.toThrow(expect.objectContaining({ message: "Identity already exists" }))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────────────────────

describe("AuthService.login — password (auth0)", () => {
  it("returns the user and a signed JWT when password is correct", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue({
      id:             "identity-uuid",
      user_id:        mockUser.id,
      provider:       "auth0",
      provider_id:    null,
      identify_name:  "email",
      identify_value: "jane@example.com",
      password_hash:  validPasswordHash,
      created_at:     new Date(),
      updated_at:     new Date(),
      user:           { ...mockUser, email_verified_at: new Date() },
    } as never)

    const result = await authService.login({
      identity: {
        provider:       "auth0",
        identify_name:  "email",
        identify_value: "jane@example.com",
        password:       VALID_PASSWORD,
      },
    })

    expect(result.user.email).toBe("jane@example.com")
    expect(result.user).not.toHaveProperty("email_verified_at")
    expect(result.user).not.toHaveProperty("banned_at")
    expect(result.token).toBe("mock-jwt-token")
    expect(vi.mocked(signJwt)).toHaveBeenCalledWith(mockUser.id)
  })

  it("throws ValidationError when the password is wrong", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue({
      id:             "identity-uuid",
      user_id:        mockUser.id,
      provider:       "auth0",
      provider_id:    null,
      identify_name:  "email",
      identify_value: "jane@example.com",
      password_hash:  validPasswordHash,
      created_at:     new Date(),
      updated_at:     new Date(),
      user:           mockUser,
    } as never)

    await expect(
      authService.login({
        identity: {
          provider:       "auth0",
          identify_name:  "email",
          identify_value: "jane@example.com",
          password:       "WrongPassword!",
        },
      })
    ).rejects.toThrow(expect.objectContaining({ message: "Invalid credentials" }))
  })

  it("throws ValidationError when no identity exists for this email", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue(null)

    await expect(
      authService.login({
        identity: {
          provider:       "auth0",
          identify_name:  "email",
          identify_value: "unknown@example.com",
          password:       "SomePass1!",
        },
      })
    ).rejects.toThrow(expect.objectContaining({ message: "Invalid credentials" }))
  })

  it("throws ValidationError when password_hash is missing from the stored identity", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue({
      id:             "identity-uuid",
      provider:       "auth0",
      identify_name:  "email",
      identify_value: "jane@example.com",
      password_hash:  null,
      user:           mockUser,
    } as never)

    await expect(
      authService.login({
        identity: {
          provider:       "auth0",
          identify_name:  "email",
          identify_value: "jane@example.com",
          password:       VALID_PASSWORD,
        },
      })
    ).rejects.toThrow(expect.objectContaining({ message: "Invalid credentials" }))
  })
})

describe("AuthService.login — OAuth", () => {
  const oauthIdentity = {
    provider:       "google",
    provider_id:    "google-uid-123",
    identify_name:  "email",
    identify_value: "jane@example.com",
  }

  it("creates a new user, generates code, and returns JWT on first OAuth login", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue(null)
    vi.mocked(authRepository.findOrCreateOAuthUser).mockResolvedValue({
      ...mockUser,
      email_verified_at: new Date(),
    })

    const result = await authService.login({
      identity: oauthIdentity,
      user: { first_name: "Jane", last_name: "Doe", email: "jane@example.com" },
    })

    expect(authRepository.findOrCreateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        identity:     expect.objectContaining({ provider: "google" }),
        emailToSearch: "jane@example.com",
        code:          "TEST01",
      })
    )
    expect(result.user).not.toHaveProperty("email_verified_at")
    expect(result.token).toBe("mock-jwt-token")
    expect(vi.mocked(signJwt)).toHaveBeenCalledWith(mockUser.id)
  })

  it("links the new provider to an existing user when emails match, returns JWT", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue(null)
    vi.mocked(authRepository.findOrCreateOAuthUser).mockResolvedValue({
      ...mockUser,
      email_verified_at: new Date(),
    })

    const result = await authService.login({ identity: oauthIdentity })

    expect(authRepository.findOrCreateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ emailToSearch: "jane@example.com" })
    )
    expect(result.token).toBe("mock-jwt-token")
    expect(vi.mocked(signJwt)).toHaveBeenCalledWith(mockUser.id)
  })

  it("returns the existing user and a JWT directly when the OAuth identity is already registered", async () => {
    vi.mocked(authRepository.findIdentityWithUser).mockResolvedValue({
      id:             "identity-uuid",
      provider:       "google",
      provider_id:    "google-uid-123",
      identify_name:  "email",
      identify_value: "jane@example.com",
      password_hash:  null,
      user:           { ...mockUser, email_verified_at: new Date() },
    } as never)

    const result = await authService.login({ identity: oauthIdentity })

    expect(authRepository.findOrCreateOAuthUser).not.toHaveBeenCalled()
    expect(result.user.email).toBe(mockUser.email)
    expect(result.token).toBe("mock-jwt-token")
    expect(vi.mocked(signJwt)).toHaveBeenCalledWith(mockUser.id)
  })
})
