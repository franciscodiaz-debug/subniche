import { NextRequest, NextResponse } from "next/server"
import { ApiBaseController } from "./api-base.controller"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { Validate } from "@/server/middleware/validate.middleware"
import { requireAuth } from "@/server/middleware/auth.middleware"
import { mediaService } from "@/server/services/media.service"
import { createMediaSchema } from "@/server/validators/media.validator"
import type { ValidatedRequest } from "@/server/middleware/validate.middleware"
import type { CreateMediaBody } from "@/server/validators/media.validator"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
}

@ApiTag("Media")
class MediaController extends ApiBaseController {
  /*
  @ApiOperation({
    method: "get",
    path: "/media",
    summary: "List media. Use mediable_type + mediable_id query params to filter by resource.",
    parameters: [
      { name: "mediable_type", in: "query" as const, required: false, schema: { type: "string" as const } },
      { name: "mediable_id", in: "query" as const, required: false, schema: { type: "string" as const, format: "uuid" } },
    ],
    responses: {
      "200": dataResponse("Success", { type: "array", items: ref("Media") }),
      "422": errorResponse("Validation error"),
    },
  })
  async getAll(): Promise<NextResponse> {
    return this.handleResponse(() => mediaService.getAll())
  }

  async getByMorphable(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url)
    const mediableType = searchParams.get("mediable_type")
    const mediableId = searchParams.get("mediable_id")

    if (!mediableType || !mediableId) {
      return NextResponse.json(
        { data: null, error: "mediable_type and mediable_id are required" },
        { status: 422 }
      )
    }

    const uuidResult = z.uuid().safeParse(mediableId)
    if (!uuidResult.success) {
      return NextResponse.json(
        { data: null, error: "mediable_id must be a valid UUID" },
        { status: 422 }
      )
    }

    return this.handleResponse(() => mediaService.getByMorphable(mediableType, mediableId))
  }

  @ApiOperation({
    method: "get",
    path: "/media/{id}",
    summary: "Get media by ID",
    parameters: [idParam],
    responses: { "200": dataResponse("Success", ref("Media")), "404": errorResponse("Not found") },
  })
  async getOne(id: string): Promise<NextResponse> {
    return this.handleResponse(() => mediaService.getById(id))
  }
  */

  @ApiOperation({
    method: "post",
    path: "/media",
    summary: "Upload a media file (base64)",
    secured: true,
    requestBody: jsonBody(ref("CreateMediaBody")),
    responses: {
      "200": dataResponse("Created", ref("Media")),
      "401": errorResponse("Unauthorized"),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(() => createMediaSchema)
  async create(req: NextRequest): Promise<NextResponse> {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { validated } = req as ValidatedRequest<CreateMediaBody>
    return this.handleResponse(() =>
      mediaService.upload({ ...validated, user_id: auth.userId })
    )
  }

  @ApiOperation({
    method: "delete",
    path: "/media/{id}",
    summary: "Delete media and its files",
    secured: true,
    parameters: [idParam],
    responses: {
      "200": dataResponse("Deleted", ref("Media")),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Not found"),
    },
  })
  async delete(req: NextRequest, id: string): Promise<NextResponse> {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    return this.handleResponse(() => mediaService.delete(id, auth.userId))
  }
}

export const mediaController = new MediaController()
