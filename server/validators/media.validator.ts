import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"
import { mediaPublicSchema } from "@/server/models/media.model"

export const createMediaSchema = z.object({
  mediable_type: z.string().min(1).max(50).regex(/^[a-z_]+$/, "mediable_type must be lowercase letters and underscores only"),
  mediable_id: z.uuid(),
  base64: z.string().min(1, "base64 image data is required"),
  order: z.number().int().min(0).optional().default(0),
})

export const mediaSchema = mediaPublicSchema

registerSchema("Media", mediaSchema)
registerSchema("CreateMediaBody", createMediaSchema)

export type CreateMediaBody = z.infer<typeof createMediaSchema>
