import { NextRequest, NextResponse } from "next/server"
import { AdminBaseController } from "./base.admin.controller"
import { categoryAdminService } from "@/server/services/admin/category.admin.service"
import { createCategorySchema, updateCategorySchema, adminCreateCategorySchema } from "@/server/validators/category.validator"
import type { AdminCreateCategoryInput } from "@/server/validators/category.validator"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { Validate } from "@/server/middleware/validate.middleware"
import type { ValidatedRequest } from "@/server/middleware/validate.middleware"
import type { CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic } from "@/server/models/category.model"
import type { Category } from ".prisma/client"
import { slugify } from "@/server/utils/slug"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "Category UUID",
}

@ApiTag("Admin / Categories", { secured: true })
class AdminCategoryController extends AdminBaseController<Category, CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic> {
  constructor() {
    super(categoryAdminService, createCategorySchema, updateCategorySchema)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/categories",
    summary: "List all categories (flat)",
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("Category") }),
    },
  })
  override getAll(req: NextRequest) {
    return super.getAll(req)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/categories/{id}",
    summary: "Get a category by ID",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Success", ref("Category")),
      "404": errorResponse("Not found"),
    },
  })
  override getOne(req: NextRequest, id: string) {
    return super.getOne(req, id)
  }

  @ApiOperation({
    method: "post",
    path: "/admin/categories",
    summary: "Create a category",
    requestBody: jsonBody(ref("CreateCategoryBody")),
    responses: {
      "200": dataResponse("Created", ref("Category")),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(adminCreateCategorySchema)
  override async create(req: NextRequest): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => {
      const validated = (req as ValidatedRequest<AdminCreateCategoryInput>).validated
      return this.service.create({ ...validated, slug: validated.slug ?? slugify(validated.title) })
    })
  }

  @ApiOperation({
    method: "patch",
    path: "/admin/categories/{id}",
    summary: "Update a category",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateCategoryBody")),
    responses: {
      "200": dataResponse("Updated", ref("Category")),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  override update(req: NextRequest, id: string) {
    return super.update(req, id)
  }

  @ApiOperation({
    method: "delete",
    path: "/admin/categories/{id}",
    summary: "Delete a category",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("Category")),
      "404": errorResponse("Not found"),
    },
  })
  override delete(req: NextRequest, id: string) {
    return super.delete(req, id)
  }
}

export const adminCategoryController = new AdminCategoryController()
