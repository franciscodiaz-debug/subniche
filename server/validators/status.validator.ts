import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { statusPublicSchema } from "@/server/models/status.model"

export const createStatusSchema = z.object({
  name: z.string().min(1, "Name is required").max(45),
  code: z.string().min(1, "Code is required").max(45),
  icon: z.string().min(1, "Icon is required").max(45),
})

export const updateStatusSchema = createStatusSchema.partial()

registerSchema("Status", statusPublicSchema)
registerSchema("CreateStatusBody", createStatusSchema)
registerSchema("UpdateStatusBody", updateStatusSchema)

export type CreateStatusBody = z.infer<typeof createStatusSchema>
export type UpdateStatusBody = z.infer<typeof updateStatusSchema>
