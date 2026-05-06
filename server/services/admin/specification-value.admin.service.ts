import { BaseService } from "@/server/services/base.service"
import { specificationValueRepository } from "@/server/repositories/specification-value.repository"
import { SpecificationValueAdminMapper } from "@/server/mappers/specification-value.mapper"
import type { CreateSpecificationValueInput, UpdateSpecificationValueInput, SpecificationValueAdminPublic } from "@/server/models/specification-value.model"
import type { SpecificationValue } from ".prisma/client"

class SpecificationValueAdminService extends BaseService<SpecificationValue, CreateSpecificationValueInput, UpdateSpecificationValueInput, SpecificationValueAdminPublic> {
  constructor() {
    super(specificationValueRepository, "SpecificationValue", SpecificationValueAdminMapper)
  }
}

export const specificationValueAdminService = new SpecificationValueAdminService()
