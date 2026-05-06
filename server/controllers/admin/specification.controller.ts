import { NextRequest } from "next/server"
import { AdminBaseController } from "./base.admin.controller"
import { specificationAdminService } from "@/server/services/admin/specification.admin.service"
import { createSpecificationSchema, updateSpecificationSchema } from "@/server/validators/specification.validator"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import type { CreateSpecificationInput, UpdateSpecificationInput } from "@/server/models/specification.model"
import type { Specification } from ".prisma/client"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "Specification UUID",
}

@ApiTag("Admin / Specifications", { secured: true })
class AdminSpecificationController extends AdminBaseController<Specification, CreateSpecificationInput, UpdateSpecificationInput> {
  constructor() {
    super(specificationAdminService, createSpecificationSchema, updateSpecificationSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specifications",
    summary: "List all specifications",
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("Specification") }),
    },
  })
  override getAll(req: NextRequest) {
    return super.getAll(req)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/specifications/{id}",
    summary: "Get a specification by ID",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Success", ref("Specification")),
      "404": errorResponse("Not found"),
    },
  })
  override getOne(req: NextRequest, id: string) {
    return super.getOne(req, id)
  }

  @ApiOperation({
    method: "post",
    path: "/admin/specifications",
    summary: "Create a specification",
    requestBody: jsonBody(ref("CreateSpecificationBody")),
    responses: {
      "200": dataResponse("Created", ref("Specification")),
      "422": errorResponse("Validation error"),
    },
  })
  override create(req: NextRequest) {
    return super.create(req)
  }

  @ApiOperation({
    method: "patch",
    path: "/admin/specifications/{id}",
    summary: "Update a specification",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateSpecificationBody")),
    responses: {
      "200": dataResponse("Updated", ref("Specification")),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  override update(req: NextRequest, id: string) {
    return super.update(req, id)
  }

  @ApiOperation({
    method: "delete",
    path: "/admin/specifications/{id}",
    summary: "Delete a specification",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("Specification")),
      "404": errorResponse("Not found"),
    },
  })
  override delete(req: NextRequest, id: string) {
    return super.delete(req, id)
  }
}

export const adminSpecificationController = new AdminSpecificationController()
