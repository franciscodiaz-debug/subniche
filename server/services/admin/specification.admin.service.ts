import { BaseService } from "@/server/services/base.service"
import { specificationRepository } from "@/server/repositories/specification.repository"
import type { CreateSpecificationInput, UpdateSpecificationInput } from "@/server/models/specification.model"
import type { Specification } from ".prisma/client"

class SpecificationAdminService extends BaseService<Specification, CreateSpecificationInput, UpdateSpecificationInput> {
  constructor() {
    super(specificationRepository, "Specification")
  }
}

export const specificationAdminService = new SpecificationAdminService()
