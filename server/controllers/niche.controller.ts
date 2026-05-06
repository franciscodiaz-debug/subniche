import { ApiOperation, ApiTag, dataResponse, errorResponse, ref } from "@/server/decorators/api.decorators"
import { nicheService } from "@/server/services/niche.service"
import { createNicheSchema, updateNicheSchema } from "@/server/validators/niche.validator"
import { BaseController } from "./base.controller"
import type { CreateNicheInput, NichePublic, UpdateNicheInput } from "@/server/models/niche.model"
import type { Niche } from ".prisma/client"
import { NextResponse } from "next/server"

const slugParam = {
  name: "slug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "slug" },
  description: "The slug of the niche"
}

@ApiTag("Niche")
class NicheController extends BaseController<Niche, CreateNicheInput, UpdateNicheInput, NichePublic> {
  constructor() {
    super(nicheService, createNicheSchema, updateNicheSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/niche",
    summary: "List all niches",
    responses: { "200": dataResponse("Success", { type: "array", items: ref("Niche") }) },
  })
  override getAll() { return super.getAll() }

  @ApiOperation({
    method: "get",
    path: "/niche/{slug}",
    summary: "Get niche by slug",
    parameters: [slugParam],
    responses: { "200": dataResponse("Success", ref("Niche")), "404": errorResponse("Not found") },
  })
  getBySlug(slug: string): Promise<NextResponse> { return this.handleResponse(() => nicheService.getBySlug(slug)) }
}

export const nicheController = new NicheController()
