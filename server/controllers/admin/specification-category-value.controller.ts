import { NextRequest } from "next/server"
import { AdminBaseController } from "./base.admin.controller"
import { specificationCategoryValueAdminService } from "@/server/services/admin/specification-category-value.admin.service"
import { createSpecificationCategoryValueSchema, updateSpecificationCategoryValueSchema } from "@/server/validators/specification-category-value.validator"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import type { CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput } from "@/server/models/specification-category-value.model"
import type { SpecificationCategoryValue } from ".prisma/client"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "SpecificationCategoryValue UUID",
}

@ApiTag("Admin / Specification Category Values", { secured: true })
class AdminSpecificationCategoryValueController extends AdminBaseController<SpecificationCategoryValue, CreateSpecificationCategoryValueInput, UpdateSpecificationCategoryValueInput> {
  constructor() {
    super(specificationCategoryValueAdminService, createSpecificationCategoryValueSchema, updateSpecificationCategoryValueSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specification-category-values",
    summary: "List all specification category values",
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("SpecificationCategoryValue") }),
    },
  })
  override getAll(req: NextRequest) {
    return super.getAll(req)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specification-category-values/{id}",
    summary: "Get a specification category value by ID",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Success", ref("SpecificationCategoryValue")),
      "404": errorResponse("Not found"),
    },
  })
  override getOne(req: NextRequest, id: string) {
    return super.getOne(req, id)
  }

  @ApiOperation({
    method: "post",
    path: "/admin/specification-category-values",
    summary: "Create a specification category value",
    requestBody: jsonBody(ref("CreateSpecificationCategoryValueBody")),
    responses: {
      "200": dataResponse("Created", ref("SpecificationCategoryValue")),
      "422": errorResponse("Validation error"),
    },
  })
  override create(req: NextRequest) {
    return super.create(req)
  }

  @ApiOperation({
    method: "patch",
    path: "/admin/specification-category-values/{id}",
    summary: "Update a specification category value",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateSpecificationCategoryValueBody")),
    responses: {
      "200": dataResponse("Updated", ref("SpecificationCategoryValue")),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  override update(req: NextRequest, id: string) {
    return super.update(req, id)
  }

  @ApiOperation({
    method: "delete",
    path: "/admin/specification-category-values/{id}",
    summary: "Delete a specification category value",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("SpecificationCategoryValue")),
      "404": errorResponse("Not found"),
    },
  })
  override delete(req: NextRequest, id: string) {
    return super.delete(req, id)
  }
}

export const adminSpecificationCategoryValueController = new AdminSpecificationCategoryValueController()
