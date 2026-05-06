import { userIdentityRepository } from "@/server/repositories/user-identity.repository"
import type { CreateUserIdentityInput, UpdateUserIdentityInput } from "@/server/models/user-identity.model"
import type { UserIdentity } from ".prisma/client"
import { BaseService } from "./base.service"

class UserIdentityService extends BaseService<UserIdentity, CreateUserIdentityInput, UpdateUserIdentityInput> {
  constructor() {
    super(userIdentityRepository, "UserIdentity")
  }
}

export const userIdentityService = new UserIdentityService()
