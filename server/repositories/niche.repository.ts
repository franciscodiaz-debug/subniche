import { prisma } from "@/lib/prisma"
import type { CreateNicheInput, UpdateNicheInput } from "@/server/models/niche.model"
import type { Niche } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class NicheRepository extends BaseRepository<Niche, CreateNicheInput, UpdateNicheInput> {
  constructor() {
    super(prisma.niche, "order", "asc")
  }

  findBySlug(slug: string): Promise<Niche | null> {
    return prisma.niche.findUnique({ where: { slug } })
  }
}

export const nicheRepository = new NicheRepository()
