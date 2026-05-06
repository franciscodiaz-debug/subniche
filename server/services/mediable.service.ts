import { prisma } from "@/lib/prisma"
import { mediaRepository } from "@/server/repositories/media.repository"
import { mediaService } from "@/server/services/media.service"
import type { Media } from ".prisma/client"
import type { ImageInput } from "@/server/models/media.model"

class MediaableService {
  async fetchMedia(mediableType: string, entityId: string): Promise<Media[]> {
    return mediaRepository.findByMorphable(mediableType, entityId)
  }

  async appendImages(mediableType: string, entityId: string, userId: string, images: ImageInput[]): Promise<void> {
    for (const img of images) {
      await mediaService.upload({
        user_id: userId,
        mediable_type: mediableType,
        mediable_id: entityId,
        base64: img.base64!,
        order: img.order,
      })
    }
  }

  async fetchCover(mediableType: string, entityId: string): Promise<Media | null> {
    return prisma.media.findFirst({
      where: { mediable_type: mediableType, mediable_id: entityId },
      orderBy: { order: "asc" },
    })
  }

  async enrich<T extends { id: string }>(mediableType: string, entity: T): Promise<T & { images: Media[] }> {
    const images = await this.fetchMedia(mediableType, entity.id)
    return { ...entity, images }
  }

  async syncImages(mediableType: string, entityId: string, userId: string, images: ImageInput[]): Promise<void> {
    const existing = await mediaRepository.findByMorphable(mediableType, entityId)
    const keptIds = new Set(images.filter((i) => i.id).map((i) => i.id!))

    for (const m of existing) {
      if (!keptIds.has(m.id)) {
        await mediaService.delete(m.id, userId)
      }
    }

    for (const img of images.filter((i) => i.id)) {
      await prisma.media.update({ where: { id: img.id }, data: { order: img.order } })
    }

    for (const img of images.filter((i) => !i.id && i.base64)) {
      await mediaService.upload({
        user_id: userId,
        mediable_type: mediableType,
        mediable_id: entityId,
        base64: img.base64!,
        order: img.order,
      })
    }
  }
}

export const mediableService = new MediaableService()
