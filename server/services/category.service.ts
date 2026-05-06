import { categoryRepository } from "@/server/repositories/category.repository"
import { nicheRepository } from "@/server/repositories/niche.repository"
import type { CreateCategoryInput, UpdateCategoryInput, CategoryPublic, CategoryWithSpecsPublic } from "@/server/models/category.model"
import { CategoryMapper } from "@/server/mappers/category.mapper"
import type { Category } from ".prisma/client"
import { BaseService } from "./base.service"
import { NotFoundError } from "../errors/client.error"

class CategoryService extends BaseService<Category, CreateCategoryInput, UpdateCategoryInput, CategoryPublic> {
  constructor() {
    super(categoryRepository, "Category", CategoryMapper)
  }

  async getByNiche(nicheSlug: string): Promise<CategoryPublic[]> {
    const niche = await nicheRepository.getModel().findFirst({ where: { slug: nicheSlug } })
    if (!niche) throw new NotFoundError("Niche not found")
    const categories = await categoryRepository.findByNicheId(niche.id)
    return CategoryMapper.toTree(categories)
  }

  async getByNicheAndSlug(nicheSlug: string, categorySlug: string): Promise<CategoryWithSpecsPublic> {
    const niche = await nicheRepository.getModel().findFirst({ where: { slug: nicheSlug } })
    if (!niche) throw new NotFoundError("Niche not found")

    const category = await categoryRepository.getModel().findFirst({
      where: { niche_id: niche.id, slug: categorySlug },
    })
    if (!category) throw new NotFoundError("Category not found")

    const [subtree, specifications] = await Promise.all([
      categoryRepository.findSubtreeById(category.id),
      categoryRepository.findSpecificationsByCategoryId(category.id),
    ])

    const [root] = CategoryMapper.toTree(subtree)
    return { ...root, specifications }
  }
}

export const categoryService = new CategoryService()
