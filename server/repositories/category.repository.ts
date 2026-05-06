import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { CreateCategoryInput, UpdateCategoryInput, CategorySpecificationEntry } from "@/server/models/category.model"
import type { Category } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class CategoryRepository extends BaseRepository<Category, CreateCategoryInput, UpdateCategoryInput> {
  constructor() {
    super(prisma.category, "order", "asc")
  }

  findByNicheId(nicheId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where:   { niche_id: nicheId },
      orderBy: { order: "asc" },
    })
  }

  async findSpecificationsByCategoryId(categoryId: string): Promise<CategorySpecificationEntry[]> {
    const rows = await prisma.specificationCategoryValue.findMany({
      where: { category_id: categoryId },
      include: {
        specification_value: {
          include: { specification: true },
        },
      },
    })

    const specMap = new Map<string, { order: number; entry: CategorySpecificationEntry }>()
    for (const row of rows) {
      const spec = row.specification_value.specification
      if (!specMap.has(spec.id)) {
        specMap.set(spec.id, {
          order: spec.order,
          entry: {
            id: spec.id,
            name: spec.name,
            type: spec.type,
            field_config: spec.field_config,
            specification_category_values: [],
          },
        })
      }
      specMap.get(spec.id)!.entry.specification_category_values.push({
        id: row.id,
        value: row.specification_value.value,
      })
    }

    return [...specMap.values()]
      .sort((a, b) => a.order - b.order)
      .map(({ entry }) => entry)
  }

  // Fetches the target category and all its descendants using a recursive CTE.
  // Avoids loading the entire niche's category tree when only a subtree is needed.
  findSubtreeById(categoryId: string): Promise<Category[]> {
    return prisma.$queryRaw<Category[]>(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT * FROM categories WHERE id = ${categoryId}::uuid
        UNION ALL
        SELECT c.* FROM categories c
        INNER JOIN subtree s ON c.parent_id = s.id
      )
      SELECT * FROM subtree
    `)
  }
}

export const categoryRepository = new CategoryRepository()
