import { createHash, scrypt, randomBytes, timingSafeEqual } from "crypto"
import { generateUniqueUserCode } from "@/server/utils/user-code"
import { promisify } from "util"
import type {
  InitiateRegisterBody,
  CompleteRegisterBody,
  LoginBody,
} from "@/server/validators/auth.validator"
import type { EmailVerificationToken } from ".prisma/client"
import { authRepository } from "../repositories/auth.repository"
import { emailVerificationTokenRepository } from "../repositories/email-verification-token.repository"
import { ValidationError, NotFoundError, ConflictError } from "../errors/client.error"
import type { EmailService } from "./email/email.service"
import { signJwt } from "../utils/jwt"
import { getLogger } from "../utils/logger"
import { UserMapper } from "../mappers/user.mapper"
import { UserPublic } from "../models/user.model"

const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

export type LoginResult = { user: UserPublic; token: string }

class AuthService {
  private emailService: EmailService | null = null

  /**
   * Inject the active email provider at startup.
   * Keep null until a real provider is configured.
   */
  setEmailService(service: EmailService) {
    this.emailService = service
  }

  // ── Step 1: Initiate registration ────────────────────────────────────────

  async initiateRegistration(body: InitiateRegisterBody, baseUrl: string): Promise<{ message: string }> {
    const { email } = body

    const existingUser = await authRepository.findUserByEmail(email)
    if (existingUser) throw new ValidationError("Email already registered")

    // Invalidate any previous pending token for this email
    await emailVerificationTokenRepository.deleteByEmail(email)

    // Generate a secure random token and store its hash
    const rawToken = randomBytes(32).toString("hex")
    getLogger().info("user initiateRegistration rawToken:", rawToken)
    const tokenHash = this.hashToken(rawToken)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    const code = await generateUniqueUserCode()

    await emailVerificationTokenRepository.create({ 
      email, 
      token_hash: tokenHash,
      expires_at: expiresAt,
      suggested_code: code 
    })

    if (this.emailService) {
      await this.emailService.sendVerificationEmail(email, rawToken, baseUrl)
    }
    // If no email service is configured the token is simply stored — useful in dev.
    return { message: "Verification email sent" }
  }

  // ── Step 2: Verify email ─────────────────────────────────────────────────

  async verifyEmailToken(rawToken: string): Promise<{ email: string, code: string }> {
    const record = await this.validateToken(rawToken)
    return { email: record.email, code: record.suggested_code }
  }

  // ── Step 3: Complete registration ────────────────────────────────────────

  async completeRegistration(body: CompleteRegisterBody): Promise<UserPublic> {
    const { token, password, user: userData } = body

    const record = await this.validateToken(token)

    const existingUser = await authRepository.findUserByEmail(record.email)
    if (existingUser) throw new ValidationError("Email already registered")

    const existingUserCode = await authRepository.findUserByCode(userData.code)
    if (existingUserCode) throw new ValidationError("Code already registered")

    const existingIdentity = await authRepository.findIdentityByEmail(record.email)
    if (existingIdentity) throw new ValidationError("Identity already exists")

    const password_hash = await this.hashPassword(password)

    try {
      const created = await authRepository.completeRegistration({
        tokenId: record.id,
        email: record.email,
        userData,
        password_hash,
      })
      return UserMapper.toPublic({ ...created, media: null })
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ConflictError("Email or code already registered")
      }
      throw error
    }
  }

  // Validate if the token is valid
  async validateToken(token: string): Promise<EmailVerificationToken> {
    const record = await emailVerificationTokenRepository.findByTokenHash(this.hashToken(token))
    if (!record) throw new NotFoundError("Invalid or expired verification token")
    if (record.verified_at) throw new ValidationError("Token already used")
    if (record.expires_at < new Date()) throw new ValidationError("Verification token has expired")
    return record;
  }

  // ── Login (auth0 + OAuth) ──────────────────────────────────────────────────

  async login(body: LoginBody): Promise<LoginResult> {
    const { identity, user } = body
    const isPasswordIdentity = this.isPasswordIdentity(identity)

    const existingIdentity = await authRepository.findIdentityWithUser(
      identity.provider,
      identity.identify_name,
      identity.identify_value,
    )

    if (existingIdentity) {
      if (isPasswordIdentity) {
        if (!existingIdentity.password_hash) throw new ValidationError("Invalid credentials")
        const valid = await this.verifyPassword(identity.password ?? "", existingIdentity.password_hash)
        if (!valid) throw new ValidationError("Invalid credentials")
      }

      const user = UserMapper.toPublic({ ...existingIdentity.user, media: null })
      const token = await signJwt(existingIdentity.user.id)
      return { user, token }
    }

    if (isPasswordIdentity) {
      throw new ValidationError("Invalid credentials")
    }

    // OAuth: link to existing user by email or create a new one
    const code = await generateUniqueUserCode()
    const userCreated = await authRepository.findOrCreateOAuthUser({
      identity: {
        provider: identity.provider,
        provider_id: identity.provider_id ?? null,
        identify_name: identity.identify_name,
        identify_value: identity.identify_value,
      },
      emailToSearch: identity.identify_name === "email" ? identity.identify_value : undefined,
      userCreateData: user ?? undefined,
      code,
    })

    const token = await signJwt(userCreated.id)
    return { user: UserMapper.toPublic({ ...userCreated, media: null }), token }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async hashPassword(plain: string): Promise<string> {
    const scryptAsync = promisify(scrypt)
    const salt = randomBytes(16).toString("hex")
    const derived = (await scryptAsync(plain, salt, 64)) as Buffer
    return `${salt}:${derived.toString("hex")}`
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    const scryptAsync = promisify(scrypt)
    const [salt, stored] = hash.split(":")
    const derived = (await scryptAsync(plain, salt, 64)) as Buffer
    const storedBuffer = Buffer.from(stored, "hex")
    return derived.length === storedBuffer.length && timingSafeEqual(derived, storedBuffer)
  }

  private hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex")
  }

  private isPasswordIdentity(identity: LoginBody["identity"]) {
    return identity.provider === "auth0" && "password" in identity
  }

}

export const authService = new AuthService()
