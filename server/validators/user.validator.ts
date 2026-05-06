import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { userPublicSchema } from "@/server/models/user.model"

export const roleSchema = z.enum(["superadmin", "admin", "member"])

// Plain string datetimes — serializable to JSON Schema for Swagger docs
const userSwaggerBase = z.object({
  first_name: z.string().max(100).nullable().optional(),
  last_name: z.string().max(100).nullable().optional(),
  email: z.email().max(255).nullable().optional(),
  email_verified_at: z.iso.datetime().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  location_id: z.uuid().nullable().optional(),
  code: z.string().min(6).max(15),
  code_updated_at: z.iso.datetime().nullable().optional(),
  banned_at: z.iso.datetime().nullable().optional(),
})

// Datetime fields transformed to Date — used by the controller for validation
export const createUserSchema = userSwaggerBase.omit({
  banned_at: true,
  email_verified_at: true,
  code_updated_at: true,
})

export const updateUserSchema = createUserSchema.partial().omit({ code: true })

export const responseUserSchema = userSwaggerBase.extend({
  id: z.uuid(),
  role: roleSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("User", userPublicSchema)
registerSchema("CreateUserBody", userSwaggerBase)
registerSchema("UpdateUserBody", userSwaggerBase.partial())

export type CreateUserBody = z.infer<typeof createUserSchema>
export type UpdateUserBody = z.infer<typeof updateUserSchema>
