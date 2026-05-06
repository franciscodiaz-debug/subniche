import type { UserIdentity as PrismaUserIdentity } from ".prisma/client"

export class UserIdentity implements PrismaUserIdentity {
  id: string
  user_id: string
  provider: string
  provider_id: string | null
  identify_name: string
  identify_value: string
  password_hash: string | null
  created_at: Date
  updated_at: Date

  constructor(data: PrismaUserIdentity) {
    this.id = data.id
    this.user_id = data.user_id
    this.provider = data.provider
    this.provider_id = data.provider_id
    this.identify_name = data.identify_name
    this.identify_value = data.identify_value
    this.password_hash = data.password_hash
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateUserIdentityInput = {
  provider: string
  provider_id?: string | null
  identify_name: string
  identify_value: string
  password_hash?: string | null
}

export type UpdateUserIdentityInput = Partial<CreateUserIdentityInput>