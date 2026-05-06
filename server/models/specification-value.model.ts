import type { SpecificationValue as PrismaSpecificationValue } from ".prisma/client"

export type SpecificationValueAdminPublic = Omit<PrismaSpecificationValue, "bitpos">

export class SpecificationValue implements PrismaSpecificationValue {
  id:               string
  specification_id: string
  value:            string
  bitpos:           bigint
  created_at:       Date
  updated_at:       Date

  constructor(data: PrismaSpecificationValue) {
    this.id               = data.id
    this.specification_id = data.specification_id
    this.value            = data.value
    this.bitpos           = data.bitpos
    this.created_at       = data.created_at
    this.updated_at       = data.updated_at
  }
}

export type CreateSpecificationValueInput = {
  specification_id: string
  value:            string
}

export type UpdateSpecificationValueInput = Partial<CreateSpecificationValueInput>
