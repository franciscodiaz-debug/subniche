import { BaseService } from "@/server/services/base.service"
import { nicheRepository } from "@/server/repositories/niche.repository"
import type { CreateNicheInput, UpdateNicheInput } from "@/server/models/niche.model"
import type { Niche } from ".prisma/client"

class NicheAdminService extends BaseService<Niche, CreateNicheInput, UpdateNicheInput> {
  constructor() {
    super(nicheRepository, "Niche")
  }
}

export const nicheAdminService = new NicheAdminService()
