import { prisma } from "@/lib/prisma"
import type {
  CreateEmailVerificationTokenInput,
  UpdateEmailVerificationTokenInput,
} from "@/server/models/email-verification-token.model"
import type { EmailVerificationToken } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class EmailVerificationTokenRepository extends BaseRepository<
  EmailVerificationToken,
  CreateEmailVerificationTokenInput,
  UpdateEmailVerificationTokenInput
> {
  constructor() {
    super(prisma.emailVerificationToken)
  }

  findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null> {
    return this.getModel().findFirst({ where: { token_hash: tokenHash } })
  }

  deleteByEmail(email: string): Promise<void> {
    return prisma.emailVerificationToken
      .deleteMany({ where: { email } })
      .then(() => undefined)
  }
}

export const emailVerificationTokenRepository = new EmailVerificationTokenRepository()
