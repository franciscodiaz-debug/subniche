import { prisma } from "@/lib/prisma"
import type { Specification } from ".prisma/client"
import type { CreateSpecificationInput, UpdateSpecificationInput } from "@/server/models/specification.model"
import { BaseRepository } from "./base.repository"

class SpecificationRepository extends BaseRepository<Specification, CreateSpecificationInput, UpdateSpecificationInput> {
  constructor() {
    super(prisma.specification, "order", "asc")
  }

  findByNicheId(nicheId: string): Promise<Specification[]> {
    return prisma.specification.findMany({
      where:   { niche_id: nicheId },
      orderBy: { order: "asc" },
    })
  }
}

export const specificationRepository = new SpecificationRepository()
