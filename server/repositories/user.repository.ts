import { prisma } from "@/lib/prisma"
import type { CreateUserInput, UpdateUserInput, UserWithRelations } from "@/server/models/user.model"
import { BaseRepository } from "./base.repository"

const withLocation = { include: { location: true } } as const

class UserRepository extends BaseRepository<UserWithRelations, CreateUserInput, UpdateUserInput> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(prisma.user as any)
  }

  override findAll(): Promise<UserWithRelations[]> {
    return prisma.user.findMany(withLocation) as unknown as Promise<UserWithRelations[]>
  }

  override findById(id: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({ where: { id }, ...withLocation }) as unknown as Promise<UserWithRelations | null>
  }

  override create(data: CreateUserInput): Promise<UserWithRelations> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prisma.user.create({ data: data as any, ...withLocation }) as unknown as Promise<UserWithRelations>
  }

  override update(id: string, data: UpdateUserInput): Promise<UserWithRelations> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prisma.user.update({ where: { id }, data: data as any, ...withLocation }) as unknown as Promise<UserWithRelations>
  }
}

export const userRepository = new UserRepository()
