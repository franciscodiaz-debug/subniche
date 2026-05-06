import { BaseService } from "@/server/services/base.service"
import { specificationCategoryValueRepository } from "@/server/repositories/specification-category-value.repository"
import type { CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput } from "@/server/models/specification-category-value.model"
import type { SpecificationCategoryValue } from ".prisma/client"

class SpecificationCategoryValueAdminService extends BaseService<SpecificationCategoryValue, CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput> {
  constructor() {
    super(specificationCategoryValueRepository, "SpecificationCategoryValue")
  }
}

export const specificationCategoryValueAdminService = new SpecificationCategoryValueAdminService()
