import { NextRequest } from "next/server"
import { AdminBaseController } from "./base.admin.controller"
import { specificationValueAdminService } from "@/server/services/admin/specification-value.admin.service"
import { createSpecificationValueSchema, updateSpecificationValueSchema } from "@/server/validators/specification-value.validator"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import type { CreateSpecificationValueInput, UpdateSpecificationValueInput, SpecificationValueAdminPublic } from "@/server/models/specification-value.model"
import type { SpecificationValue } from ".prisma/client"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "SpecificationValue UUID",
}

@ApiTag("Admin / Specification Values", { secured: true })
class AdminSpecificationValueController extends AdminBaseController<SpecificationValue, CreateSpecificationValueInput, UpdateSpecificationValueInput, SpecificationValueAdminPublic> {
  constructor() {
    super(specificationValueAdminService, createSpecificationValueSchema, updateSpecificationValueSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specification-values",
    summary: "List all specification values",
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("SpecificationValue") }),
    },
  })
  override getAll(req: NextRequest) {
    return super.getAll(req)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specification-values/{id}",
    summary: "Get a specification value by ID",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Success", ref("SpecificationValue")),
      "404": errorResponse("Not found"),
    },
  })
  override getOne(req: NextRequest, id: string) {
    return super.getOne(req, id)
  }

  @ApiOperation({
    method: "post",
    path: "/admin/specification-values",
    summary: "Create a specification value",
    requestBody: jsonBody(ref("CreateSpecificationValueBody")),
    responses: {
      "200": dataResponse("Created", ref("SpecificationValue")),
      "422": errorResponse("Validation error"),
    },
  })
  override create(req: NextRequest) {
    return super.create(req)
  }

  @ApiOperation({
    method: "patch",
    path: "/admin/specification-values/{id}",
    summary: "Update a specification value",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateSpecificationValueBody")),
    responses: {
      "200": dataResponse("Updated", ref("SpecificationValue")),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  override update(req: NextRequest, id: string) {
    return super.update(req, id)
  }

  @ApiOperation({
    method: "delete",
    path: "/admin/specification-values/{id}",
    summary: "Delete a specification value",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("SpecificationValue")),
      "404": errorResponse("Not found"),
    },
  })
  override delete(req: NextRequest, id: string) {
    return super.delete(req, id)
  }
}

export const adminSpecificationValueController = new AdminSpecificationValueController()
