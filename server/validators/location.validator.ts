import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { locationPublicSchema } from "@/server/models/location.model"

export const locationRequestSchema = z.object({
  zip_code: z.string().min(3).max(5).regex(/^\d{3,5}$/),
})

registerSchema("LocationResponse", locationPublicSchema)
registerSchema("LocationRequest", locationRequestSchema)
