import { z } from "zod"
import type { Media as PrismaMedia } from ".prisma/client"
import { Prisma } from ".prisma/client"

export const mediaVariantsSchema = z.object({
  original: z.string(),
  thumbnail: z.string(),
  resized: z.string(),
}).nullable()

export const mediaPublicSchema = z.object({
  id: z.uuid(),
  file_name: z.string(),
  mime_type: z.string(),
  path: z.string(),
  order: z.number(),
  variants: mediaVariantsSchema,
})

export type MediaPublic = z.infer<typeof mediaPublicSchema>

export class Media implements PrismaMedia {
  id: string
  user_id: string
  mediable_type: string
  mediable_id: string
  file_name: string
  mime_type: string
  disk: string
  path: string
  file_size: number
  order: number
  variants: Prisma.JsonValue | null
  created_at: Date
  updated_at: Date

  constructor(data: PrismaMedia) {
    this.id = data.id
    this.user_id = data.user_id
    this.mediable_type = data.mediable_type
    this.mediable_id = data.mediable_id
    this.file_name = data.file_name
    this.mime_type = data.mime_type
    this.disk = data.disk
    this.path = data.path
    this.file_size = data.file_size
    this.order = data.order
    this.variants = data.variants
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateMediaInput = {
  user_id: string
  mediable_type: string
  mediable_id: string
  file_name: string
  mime_type: string
  disk: string
  path: string
  file_size: number
  order: number
  variants: { original: string; thumbnail: string; resized: string } | null
}

export type UpdateMediaInput = Partial<CreateMediaInput>

export type UploadMediaInput = {
  user_id: string
  mediable_type: string
  mediable_id: string
  base64: string
  order: number
}

export type ImageInput = {
  id?: string
  base64?: string
  order: number
}
