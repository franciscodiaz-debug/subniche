import { NextRequest, NextResponse } from "next/server"
import { AdminBaseController } from "./base.admin.controller"
import { nicheAdminService } from "@/server/services/admin/niche.admin.service"
import { createNicheSchema, updateNicheSchema, adminCreateNicheSchema } from "@/server/validators/niche.validator"
import type { AdminCreateNicheInput } from "@/server/validators/niche.validator"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { Validate } from "@/server/middleware/validate.middleware"
import type { ValidatedRequest } from "@/server/middleware/validate.middleware"
import type { CreateNicheInput, UpdateNicheInput } from "@/server/models/niche.model"
import type { Niche } from ".prisma/client"
import { slugify } from "@/server/utils/slug"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "Niche UUID",
}

@ApiTag("Admin / Niches", { secured: true })
class AdminNicheController extends AdminBaseController<Niche, CreateNicheInput, UpdateNicheInput> {
  constructor() {
    super(nicheAdminService, createNicheSchema, updateNicheSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/niches",
    summary: "List all niches",
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("Niche") }),
    },
  })
  override getAll(req: NextRequest) {
    return super.getAll(req)
  }

  @ApiOperation({
    method: "get",
    path: "/admin/niches/{id}",
    summary: "Get a niche by ID",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Success", ref("Niche")),
      "404": errorResponse("Not found"),
    },
  })
  override getOne(req: NextRequest, id: string) {
    return super.getOne(req, id)
  }

  @ApiOperation({
    method: "post",
    path: "/admin/niches",
    summary: "Create a niche",
    requestBody: jsonBody(ref("CreateNicheBody")),
    responses: {
      "200": dataResponse("Created", ref("Niche")),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(adminCreateNicheSchema)
  override async create(req: NextRequest): Promise<NextResponse> {
    return this.handleAdminResponse(req, () => {
      const validated = (req as ValidatedRequest<AdminCreateNicheInput>).validated
      return this.service.create({ ...validated, slug: validated.slug ?? slugify(validated.title) })
    })
  }

  @ApiOperation({
    method: "patch",
    path: "/admin/niches/{id}",
    summary: "Update a niche",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateNicheBody")),
    responses: {
      "200": dataResponse("Updated", ref("Niche")),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  override update(req: NextRequest, id: string) {
    return super.update(req, id)
  }

  @ApiOperation({
    method: "delete",
    path: "/admin/niches/{id}",
    summary: "Delete a niche",
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("Niche")),
      "404": errorResponse("Not found"),
    },
  })
  override delete(req: NextRequest, id: string) {
    return super.delete(req, id)
  }
}

export const adminNicheController = new AdminNicheController()
