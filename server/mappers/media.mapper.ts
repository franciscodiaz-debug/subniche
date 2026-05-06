import type { Media } from ".prisma/client"
import { MediaPublic } from "../models/media.model"

export const MediaMapper = {
  toPublic({ id, file_name, mime_type, path, order, variants }: Media): MediaPublic {
    return { id, file_name, mime_type, path, order, variants: variants as { original: string; thumbnail: string; resized: string } | null }
  },
}
