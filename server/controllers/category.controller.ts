import { ApiOperation, ApiTag, dataResponse, errorResponse, ref } from "@/server/decorators/api.decorators"
import { categoryService } from "@/server/services/category.service"
import { ApiBaseController } from "./api-base.controller"

const nicheSlugParam = {
  name: "slug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "The slug of the niche",
}

const categorySlugParam = {
  name: "categorySlug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "The slug of the category",
}

@ApiTag("Category")
class CategoryController extends ApiBaseController {
  @ApiOperation({
    method: "get",
    path: "/niche/{slug}/categories",
    summary: "List root categories (with nested children) for a niche",
    parameters: [nicheSlugParam],
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("Category") }),
      "404": errorResponse("Niche not found"),
    },
  })
  getByNiche(nicheSlug: string) {
    return this.handleResponse(() => categoryService.getByNiche(nicheSlug))
  }

  @ApiOperation({
    method: "get",
    path: "/niche/{slug}/categories/{categorySlug}",
    summary: "Get a category with its subtree within a niche",
    parameters: [nicheSlugParam, categorySlugParam],
    responses: {
      "200": dataResponse("Success", ref("CategoryWithSpecs")),
      "404": errorResponse("Not found"),
    },
  })
  getByNicheAndSlug(nicheSlug: string, categorySlug: string) {
    return this.handleResponse(() => categoryService.getByNicheAndSlug(nicheSlug, categorySlug))
  }
}

export const categoryController = new CategoryController()
