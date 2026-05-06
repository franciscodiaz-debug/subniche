import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

export const createUserIdentitySchema = z.object({
  provider: z.string().min(1).max(50),
  provider_id: z.string().min(1).max(255).nullable().optional(),
  identify_name: z.string().min(1).max(50),
  identify_value: z.string().min(1).max(100),
  password: z.string().min(8).max(128).nullable().optional(),
})

export const updateUserIdentitySchema = createUserIdentitySchema.partial()

export const userIdentitySchema = createUserIdentitySchema.extend({
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("UserIdentity", userIdentitySchema)
registerSchema("CreateUserIdentityBody", createUserIdentitySchema)
registerSchema("UpdateUserIdentityBody", updateUserIdentitySchema)

export type CreateUserIdentityBody = z.infer<typeof createUserIdentitySchema>
export type UpdateUserIdentityBody = z.infer<typeof updateUserIdentitySchema>
