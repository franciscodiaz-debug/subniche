import { BaseService } from "./base.service"
import { mediaRepository } from "@/server/repositories/media.repository"
import { processMediaUpload, deleteMediaFiles } from "@/server/utils/media-processor"
import { NotFoundError, ValidationError } from "@/server/errors/client.error"
import type { CreateMediaInput, MediaPublic, UpdateMediaInput, UploadMediaInput } from "@/server/models/media.model"
import type { Media } from ".prisma/client"
import { MediaMapper } from "@/server/mappers/media.mapper"

class MediaService extends BaseService<Media, CreateMediaInput, UpdateMediaInput, MediaPublic > {
  constructor() {
    super(mediaRepository, "Media", MediaMapper)
  }

  async getByMorphable(mediableType: string, mediableId: string): Promise<Media[]> {
    return mediaRepository.findByMorphable(mediableType, mediableId)
  }

  async upload(input: UploadMediaInput): Promise<MediaPublic> {
    const processed = await processMediaUpload(
      input.base64,
      input.mediable_type,
      input.mediable_id
    )

    return this.create({
      user_id: input.user_id,
      mediable_type: input.mediable_type,
      mediable_id: input.mediable_id,
      ...processed,
      order: input.order,
    })
  }

  override async delete(id: string, requestingUserId?: string): Promise<MediaPublic> {
    const media = await mediaRepository.findById(id)
    if (!media) throw new NotFoundError("Media not found")

    if (requestingUserId && media.user_id !== requestingUserId) {
      throw new ValidationError("You do not have permission to delete this media")
    }

    const variants = media.variants as { original: string; thumbnail: string; resized: string } | null
    await deleteMediaFiles(variants, media.path)

    const deleted = await mediaRepository.delete(id)
    return this.serialize(deleted)
  }
}

export const mediaService = new MediaService()
