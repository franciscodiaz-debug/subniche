import { z } from "zod"
import type { User as PrismaUser, Location as PrismaLocation, Role } from ".prisma/client"
import { locationPublicSchema } from "./location.model"
import { mediaPublicSchema } from "./media.model"

export type { Role }

export type UserWithRelations = PrismaUser & { location: PrismaLocation | null }

export const userPublicSchema = z.object({
  first_name:  z.string().nullable(),
  last_name:   z.string().nullable(),
  email:       z.string().nullable(),
  phone:       z.string().nullable(),
  bio:         z.string().nullable(),
  code:        z.string(),
  role:        z.enum(["superadmin", "admin", "member"]),
  location:    locationPublicSchema.nullable(),
  cover:       mediaPublicSchema.nullable(),
})

export const userSummarySchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  code: z.string(),
  location: locationPublicSchema.nullable(),
  cover: mediaPublicSchema.nullable(),
})

export type UserPublic = z.infer<typeof userPublicSchema>
export type UserSummary = z.infer<typeof userSummarySchema>

export class User implements PrismaUser {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  email_verified_at: Date | null
  phone: string | null
  bio: string | null
  location_id: string | null
  code: string
  code_updated_at: Date | null
  role: Role
  banned_at: Date | null
  created_at: Date
  updated_at: Date

  constructor(data: PrismaUser) {
    this.id = data.id
    this.first_name = data.first_name
    this.last_name = data.last_name
    this.email = data.email
    this.email_verified_at = data.email_verified_at
    this.phone = data.phone
    this.bio = data.bio
    this.location_id = data.location_id
    this.code = data.code
    this.code_updated_at = data.code_updated_at
    this.role = data.role
    this.banned_at = data.banned_at
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateUserInput = {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  email_verified_at?: Date | null
  phone?: string | null
  bio?: string | null
  location_id?: string | null
  code?: string
  code_updated_at?: Date | null
  banned_at?: Date | null
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, "code"> & { code?: string }>
