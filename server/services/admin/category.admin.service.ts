import { BaseService } from "@/server/services/base.service"
import { categoryRepository } from "@/server/repositories/category.repository"
import { CategoryAdminMapper } from "@/server/mappers/category.mapper"
import type { CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic } from "@/server/models/category.model"
import type { Category } from ".prisma/client"

class CategoryAdminService extends BaseService<Category, CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic> {
  constructor() {
    super(categoryRepository, "Category", CategoryAdminMapper)
  }
}

export const categoryAdminService = new CategoryAdminService()
