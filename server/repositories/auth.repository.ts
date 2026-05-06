import { prisma } from "@/lib/prisma"
import type { User, UserIdentity } from ".prisma/client"
import type { CreateUserInput, UserWithRelations } from "@/server/models/user.model"

export type IdentityWithUser = UserIdentity & { user: UserWithRelations }

type CompleteRegistrationInput = {
  tokenId: string
  email: string
  userData: CreateUserInput
  password_hash: string
}

type OAuthLoginInput = {
  identity: {
    provider: string
    provider_id: string | null
    identify_name: string
    identify_value: string
  }
  emailToSearch?: string
  userCreateData?: CreateUserInput
  code: string
}

const withLocation = { include: { location: true } } as const

class AuthRepository {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email } })
  }

  findUserByCode(code: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { code } })
  }

  findIdentityByEmail(email: string): Promise<UserIdentity | null> {
    return prisma.userIdentity.findFirst({
      where: { provider: "auth0", identify_name: "email", identify_value: email },
    })
  }

  findIdentityWithUser(provider: string, identifyName: string, identifyValue: string): Promise<IdentityWithUser | null> {
    return prisma.userIdentity.findFirst({
      where: { provider, identify_name: identifyName, identify_value: identifyValue },
      include: { user: withLocation },
    }) as Promise<IdentityWithUser | null>
  }

  async completeRegistration({ tokenId, email, userData, password_hash }: CompleteRegistrationInput): Promise<UserWithRelations> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { ...(userData as any), email, email_verified_at: new Date() },
        ...withLocation,
      })

      await tx.userIdentity.create({
        data: {
          user_id: user.id,
          provider: "auth0",
          provider_id: null,
          identify_name: "email",
          identify_value: email,
          password_hash,
        },
      })

      await tx.emailVerificationToken.delete({ where: { id: tokenId } })

      return user as unknown as UserWithRelations
    })
  }

  async findOrCreateOAuthUser({ identity, emailToSearch, userCreateData, code }: OAuthLoginInput): Promise<UserWithRelations> {
    return prisma.$transaction(async (tx) => {
      let targetUser: UserWithRelations | null = null

      if (emailToSearch) {
        targetUser = (await tx.user.findFirst({
          where: { email: emailToSearch },
          ...withLocation,
        })) as UserWithRelations | null
      }

      if (!targetUser) {
        targetUser = (await tx.user.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { ...(userCreateData as any), code, email_verified_at: new Date() },
          ...withLocation,
        })) as unknown as UserWithRelations
      }

      await tx.userIdentity.create({
        data: {
          user_id: targetUser.id,
          provider: identity.provider,
          provider_id: identity.provider_id,
          identify_name: identity.identify_name,
          identify_value: identity.identify_value,
          password_hash: null,
        },
      })

      return targetUser
    })
  }
}

export const authRepository = new AuthRepository()
