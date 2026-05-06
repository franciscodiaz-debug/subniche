import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { createUserIdentitySchema } from "./user-identity.validator"
import { createUserSchema, responseUserSchema } from "./user.validator"

// ── Step 1: Initiate registration (only email) ──────────────────────────────────
export const initiateRegisterBodySchema = z.object({
  email: z.email().max(255),
})

// ── Step 2: Verify email (token comes by query param, no body) ─────────
export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1),
})

// ── Step 3: Complete registration (password + user data) ───────────────
export const completeRegisterBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  user: z.object({ 
    code: z.string().min(6).max(15),
  }),
})

// ── Login ────────────────────────────────────────────────────
export const loginBodySchema = z.object({
  identity: createUserIdentitySchema,
  user: createUserSchema.partial().nullish(),
})

// ── Swagger schemas ─────────────────────────────────────────────────────────
const safeUserResponse = responseUserSchema.omit({ email_verified_at: true, banned_at: true })

registerSchema("InitiateRegisterBody", initiateRegisterBodySchema)
registerSchema("VerifyEmailResponse", z.object({ email: z.email(), code: z.string() }))
registerSchema("CompleteRegisterBody", completeRegisterBodySchema)
registerSchema("CompleteRegisterResponse", safeUserResponse)
registerSchema("LoginUserBody", loginBodySchema)
registerSchema("LoginUserResponse", z.object({ user: safeUserResponse, token: z.string() }))

export type InitiateRegisterBody = z.infer<typeof initiateRegisterBodySchema>
export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>
export type CompleteRegisterBody = z.infer<typeof completeRegisterBodySchema>
export type LoginBody = z.infer<typeof loginBodySchema>
