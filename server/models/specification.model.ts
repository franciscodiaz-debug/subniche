import type { Specification as PrismaSpecification } from ".prisma/client"
import { Prisma } from ".prisma/client"

export class Specification implements PrismaSpecification {
  id:           string
  niche_id:     string
  name:         string
  type:         string
  field_config: Prisma.JsonValue
  order:        number
  created_at:   Date
  updated_at:   Date

  constructor(data: PrismaSpecification) {
    this.id           = data.id
    this.niche_id     = data.niche_id
    this.name         = data.name
    this.type         = data.type
    this.field_config = data.field_config
    this.order        = data.order
    this.created_at   = data.created_at
    this.updated_at   = data.updated_at
  }
}

export type CreateSpecificationInput = {
  niche_id:     string
  name:         string
  type:         string
  field_config?: Prisma.InputJsonValue
  order?:       number
}

export type UpdateSpecificationInput = Partial<CreateSpecificationInput>
