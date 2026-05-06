import type { EmailVerificationToken as PrismaEmailVerificationToken } from ".prisma/client"

export class EmailVerificationToken implements PrismaEmailVerificationToken {
  id: string
  email: string
  token_hash: string
  expires_at: Date
  suggested_code: string
  verified_at: Date | null
  created_at: Date

  constructor(data: PrismaEmailVerificationToken) {
    this.id = data.id
    this.email = data.email
    this.token_hash = data.token_hash
    this.expires_at = data.expires_at
    this.suggested_code = data.suggested_code
    this.verified_at = data.verified_at
    this.created_at = data.created_at
  }
}

export type CreateEmailVerificationTokenInput = {
  email: string
  token_hash: string
  expires_at: Date
  suggested_code: string
}

export type UpdateEmailVerificationTokenInput = Partial<Pick<CreateEmailVerificationTokenInput, "email" | "expires_at"> & {
  verified_at: Date | null
}>
