import { prisma } from "@/lib/prisma"
import type { SpecificationCategoryValue } from ".prisma/client"
import type { CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput } from "@/server/models/specification-category-value.model"
import { BaseRepository } from "./base.repository"

class SpecificationCategoryValueRepository extends BaseRepository<SpecificationCategoryValue, CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput> {
  constructor() {
    super(prisma.specificationCategoryValue, "created_at", "asc")
  }

  findByCategoryId(categoryId: string): Promise<SpecificationCategoryValue[]> {
    return prisma.specificationCategoryValue.findMany({
      where: { category_id: categoryId },
    })
  }

  findBySpecificationValueId(specificationValueId: string): Promise<SpecificationCategoryValue[]> {
    return prisma.specificationCategoryValue.findMany({
      where: { specification_value_id: specificationValueId },
    })
  }
}

export const specificationCategoryValueRepository = new SpecificationCategoryValueRepository()
