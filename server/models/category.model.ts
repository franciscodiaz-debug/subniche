import { z } from "zod"
import type { Category as PrismaCategory } from ".prisma/client"
import { Prisma } from ".prisma/client"

export type CategoryAdminPublic = Omit<PrismaCategory, "bitpos">

export type CategoryPublic = {
  id:       string
  title:    string
  slug:     string
  order:    number
  children: CategoryPublic[]
}

export const categoryPublicSchema: z.ZodType<CategoryPublic> = z.lazy(() =>
  z.object({
    id:       z.string(),
    title:    z.string(),
    slug:     z.string(),
    order:    z.number().int(),
    children: z.array(categoryPublicSchema),
  })
)

export type SpecificationCategoryValueEntry = {
  id:    string
  value: string
}

export type CategorySpecificationEntry = {
  id:                          string
  name:                        string
  type:                        string
  field_config:                Prisma.JsonValue | null
  specification_category_values: SpecificationCategoryValueEntry[]
}

export type CategoryWithSpecsPublic = CategoryPublic & {
  specifications: CategorySpecificationEntry[]
}

export const categoryWithSpecsPublicSchema = z.object({
  id:       z.uuid(),
  title:    z.string(),
  slug:     z.string(),
  order:    z.number().int(),
  children: z.array(categoryPublicSchema),
  specifications: z.array(
    z.object({
      id:           z.uuid(),
      name:         z.string(),
      type:         z.string(),
      field_config: z.any(),
      specification_category_values: z.array(
        z.object({ id: z.uuid(), value: z.string() })
      ),
    })
  ),
})

export class Category implements PrismaCategory {
  id:         string
  title:      string
  slug:       string
  niche_id:   string
  parent_id:  string | null
  order:      number
  bitpos:     bigint
  created_at: Date
  updated_at: Date

  constructor(data: PrismaCategory) {
    this.id         = data.id
    this.title      = data.title
    this.slug       = data.slug
    this.niche_id   = data.niche_id
    this.parent_id  = data.parent_id
    this.order      = data.order
    this.bitpos     = data.bitpos
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateCategoryInput = {
  title:     string
  slug:      string
  niche_id:  string
  parent_id?: string | null
  order:     number
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>
