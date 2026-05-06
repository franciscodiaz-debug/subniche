import { NextRequest, NextResponse } from "next/server"
import { ApiBaseController } from "./api-base.controller"
import { RequireAuth } from "@/server/decorators/require-auth.decorator"
import type { AuthenticatedRequest } from "@/server/decorators/require-auth.decorator"
import { Validate } from "@/server/middleware/validate.middleware"
import type { ValidatedRequest } from "@/server/middleware/validate.middleware"
import { nicheProfileService } from "@/server/services/niche-profile.service"
import { paginationSchema } from "@/server/validators/pagination.validator"
import { updateNicheProfileSchema } from "@/server/validators/niche-profile.validator"
import type { UpdateNicheProfileBody } from "@/server/validators/niche-profile.validator"
import {
  ApiTag,
  ApiOperation,
  dataResponse,
  errorResponse,
  jsonBody,
  ref,
} from "@/server/decorators/api.decorators"

const nicheSlugParam = {
  name: "nicheSlug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
}

const displayNameParam = {
  name: "displayName",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
}

@ApiTag("NicheProfile")
class NicheProfileController extends ApiBaseController {
  @ApiOperation({
    method: "get",
    path: "/niche/{nicheSlug}/user/{displayName}",
    summary: "Get a user profile within a niche with their published listings",
    parameters: [
      nicheSlugParam,
      displayNameParam,
      { name: "page",  in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
    ],
    responses: {
      "200": dataResponse("User niche profile with listings", ref("NicheProfile")),
      "404": errorResponse("Profile not found"),
    },
  })
  getByDisplayName(req: NextRequest, nicheSlug: string, displayName: string): Promise<NextResponse> {
    const url = new URL(req.url)
    const { page, limit } = paginationSchema.parse(Object.fromEntries(url.searchParams))
    return this.handleResponse(() =>
      nicheProfileService.getByDisplayName(nicheSlug, displayName, page, limit),
    )
  }

  @RequireAuth
  @ApiOperation({
    method: "patch",
    path: "/niche/{nicheSlug}/user",
    summary: "Update the authenticated user's profile within a niche",
    secured: true,
    parameters: [nicheSlugParam],
    requestBody: jsonBody(ref("UpdateNicheProfileBody")),
    responses: {
      "200": dataResponse("Updated profile", ref("NicheProfile")),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Profile not found"),
      "409": errorResponse("Display name already taken"),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(updateNicheProfileSchema)
  update(req: AuthenticatedRequest, nicheSlug: string): Promise<NextResponse> {
    const { validated } = req as unknown as ValidatedRequest<UpdateNicheProfileBody>
    return this.handleResponse(() =>
      nicheProfileService.update(nicheSlug, req.auth.userId, validated),
    )
  }
}

export const nicheProfileController = new NicheProfileController()
