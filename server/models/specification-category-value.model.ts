import type { SpecificationCategoryValue as PrismaSpecificationCategoryValue } from ".prisma/client"

export class SpecificationCategoryValue implements PrismaSpecificationCategoryValue {
  id:                     string
  category_id:            string
  specification_value_id: string
  created_at:             Date
  updated_at:             Date

  constructor(data: PrismaSpecificationCategoryValue) {
    this.id                     = data.id
    this.category_id            = data.category_id
    this.specification_value_id = data.specification_value_id
    this.created_at             = data.created_at
    this.updated_at             = data.updated_at
  }
}

export type CreateSpecificationCategoryValueInput = {
  category_id:            string
  specification_value_id: string
}

export type UpdateSpecificationCategoryValueInput = Partial<CreateSpecificationCategoryValueInput>
