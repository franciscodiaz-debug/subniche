import { prisma } from "@/lib/prisma"
import type { SpecificationValue } from ".prisma/client"
import type { CreateSpecificationValueInput, UpdateSpecificationValueInput } from "@/server/models/specification-value.model"
import { BaseRepository } from "./base.repository"

class SpecificationValueRepository extends BaseRepository<SpecificationValue, CreateSpecificationValueInput, UpdateSpecificationValueInput> {
  constructor() {
    super(prisma.specificationValue, "created_at", "asc")
  }

  findBySpecificationId(specificationId: string): Promise<SpecificationValue[]> {
    return prisma.specificationValue.findMany({
      where:   { specification_id: specificationId },
      orderBy: { created_at: "asc" },
    })
  }
}

export const specificationValueRepository = new SpecificationValueRepository()
