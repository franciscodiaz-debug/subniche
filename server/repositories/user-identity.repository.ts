import { prisma } from "@/lib/prisma"
import type { CreateUserIdentityInput, UpdateUserIdentityInput } from "@/server/models/user-identity.model"
import type { UserIdentity } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class UserIdentityRepository extends BaseRepository<UserIdentity, CreateUserIdentityInput, UpdateUserIdentityInput> {
  constructor() {
    super(prisma.userIdentity)
  }
}

export const userIdentityRepository = new UserIdentityRepository()
