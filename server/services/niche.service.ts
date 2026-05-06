import { nicheRepository } from "@/server/repositories/niche.repository"
import type { CreateNicheInput, UpdateNicheInput, NichePublic } from "@/server/models/niche.model"
import { NicheMapper } from "@/server/mappers/niche.mapper"
import type { Niche } from ".prisma/client"
import { BaseService } from "./base.service"
import { NotFoundError } from "../errors/client.error"

class NicheService extends BaseService<Niche, CreateNicheInput, UpdateNicheInput, NichePublic> {
  constructor() {
    super(nicheRepository, "Niche", NicheMapper)
  }

  async getBySlug(slug: string): Promise<NichePublic> {
    const niche = await nicheRepository.getModel().findFirst({ where: { slug } })
    if (!niche) throw new NotFoundError(`Niche not found`)
    return this.serialize(niche)
  }
}

export const nicheService = new NicheService()
