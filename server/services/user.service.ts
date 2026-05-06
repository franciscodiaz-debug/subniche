import { userRepository } from "@/server/repositories/user.repository"
import type { CreateUserInput, UpdateUserInput, UserPublic, UserWithRelations } from "@/server/models/user.model"
import { UserMapper } from "@/server/mappers/user.mapper"
import { BaseService } from "./base.service"
import { generateUniqueUserCode } from "@/server/utils/user-code"

class UserService extends BaseService<UserWithRelations, CreateUserInput, UpdateUserInput, UserPublic> {
  constructor() {
    super(userRepository, "User", UserMapper)
  }

  override async create(input: CreateUserInput): Promise<UserPublic> {
    const code = input.code ?? await generateUniqueUserCode()
    return super.create({ ...input, code })
  }
}

export const userService = new UserService()
