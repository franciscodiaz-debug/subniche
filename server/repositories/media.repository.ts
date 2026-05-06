import { prisma } from "@/lib/prisma"
import type { CreateMediaInput, UpdateMediaInput } from "@/server/models/media.model"
import type { Media } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class MediaRepository extends BaseRepository<Media, CreateMediaInput, UpdateMediaInput> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(prisma.media as any, "order", "asc")
  }

  findByMorphable(mediableType: string, mediableId: string): Promise<Media[]> {
    return prisma.media.findMany({
      where: { mediable_type: mediableType, mediable_id: mediableId },
      orderBy: { order: "asc" },
    })
  }
}

export const mediaRepository = new MediaRepository()
