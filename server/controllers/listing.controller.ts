import { NextResponse } from "next/server"
import { NicheAwareController } from "./niche-aware.controller"
import { Validate } from "@/server/middleware/validate.middleware"
import { RequireAuth, OptionalAuth } from "@/server/decorators/require-auth.decorator"
import type { AuthenticatedRequest, OptionallyAuthenticatedRequest } from "@/server/decorators/require-auth.decorator"
import { listingService } from "@/server/services/listing.service"
import { createListingSchema, updateListingSchema } from "@/server/validators/listing.validator"
import { paginationSchema } from "@/server/validators/pagination.validator"
import {
  ApiTag,
  ApiOperation,
  jsonBody,
  dataResponse,
  errorResponse,
  ref,
} from "@/server/decorators/api.decorators"
import type { ValidatedRequest } from "@/server/middleware/validate.middleware"
import type { CreateListingBody, UpdateListingBody } from "@/server/validators/listing.validator"

const nicheSlugParam = {
  name: "nicheSlug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
}

const slugParam = {
  name: "listingSlug",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
}

@ApiTag("Listing")
class ListingController extends NicheAwareController {
  @RequireAuth
  @ApiOperation({
    method: "get",
    path: "/niche/{nicheSlug}/listing",
    summary: "Get paginated listings for the authenticated user within a niche",
    secured: true,
    parameters: [
      nicheSlugParam,
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
    ],
    responses: {
      "200": dataResponse("Paginated listings", {
        type: "object",
        properties: {
          items: { type: "array", items: ref("ListingSummary") },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
        },
      }),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Niche not found"),
    },
  })
  getAll(req: AuthenticatedRequest, nicheSlug: string): Promise<NextResponse> {
    const url = new URL(req.url)
    const { page, limit } = paginationSchema.parse(Object.fromEntries(url.searchParams))
    return this.handleResponse(async () => {
      const niche = await this.resolveNiche(nicheSlug)
      return listingService.getAll(req.auth.userId, page, limit, niche.id)
    })
  }

  @OptionalAuth
  @ApiOperation({
    method: "get",
    path: "/niche/{nicheSlug}/listing/{listingSlug}",
    summary: "Get listing by slug. Published listings are public; drafts are only visible to the owner.",
    secured: true,
    parameters: [nicheSlugParam, slugParam],
    responses: {
      "200": dataResponse("Listing", ref("Listing")),
      "404": errorResponse("Not found"),
    },
  })
  getBySlug(req: OptionallyAuthenticatedRequest, _nicheSlug: string, listingSlug: string): Promise<NextResponse> {
    return this.handleResponse(() => listingService.getBySlug(listingSlug, req.auth?.userId ?? null))
  }

  @RequireAuth
  @ApiOperation({
    method: "post",
    path: "/niche/{nicheSlug}/listing",
    summary: "Create listing (starts as draft). Only title required.",
    secured: true,
    parameters: [nicheSlugParam],
    requestBody: jsonBody(ref("CreateListingBody")),
    responses: {
      "201": dataResponse("Created listing", ref("Listing")),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Niche not found"),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(createListingSchema)
  create(req: AuthenticatedRequest, nicheSlug: string): Promise<NextResponse> {
    const { validated } = req as unknown as ValidatedRequest<CreateListingBody>
    return this.handleResponse(async () => {
      const niche = await this.resolveNiche(nicheSlug)
      return listingService.create({ ...validated, niche_id: niche.id, user_id: req.auth.userId })
    }, 201)
  }

  @RequireAuth
  @ApiOperation({
    method: "patch",
    path: "/niche/{nicheSlug}/listing/{listingSlug}",
    summary: "Update listing fields (partial). Images are synced: send full desired state.",
    secured: true,
    parameters: [nicheSlugParam, slugParam],
    requestBody: jsonBody(ref("UpdateListingBody")),
    responses: {
      "200": dataResponse("Updated listing", ref("Listing")),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Not found"),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate(updateListingSchema)
  update(req: AuthenticatedRequest, _nicheSlug: string, listingSlug: string): Promise<NextResponse> {
    const { validated } = req as unknown as ValidatedRequest<UpdateListingBody>
    return this.handleResponse(() => listingService.update(listingSlug, validated, req.auth.userId))
  }

  @RequireAuth
  @ApiOperation({
    method: "patch",
    path: "/niche/{nicheSlug}/listing/{listingSlug}/publish",
    summary: "Publish a draft listing. Requires title, price, description, and at least one image.",
    secured: true,
    parameters: [nicheSlugParam, slugParam],
    responses: {
      "200": dataResponse("Published listing", ref("Listing")),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Not found"),
      "422": errorResponse("Missing required fields or images"),
    },
  })
  publish(req: AuthenticatedRequest, _nicheSlug: string, listingSlug: string): Promise<NextResponse> {
    return this.handleResponse(() => listingService.publish(listingSlug, req.auth.userId))
  }

  @RequireAuth
  @ApiOperation({
    method: "delete",
    path: "/niche/{nicheSlug}/listing/{listingSlug}",
    summary: "Delete listing",
    secured: true,
    parameters: [nicheSlugParam, slugParam],
    responses: {
      "200": errorResponse("Deleted"),
      "401": errorResponse("Unauthorized"),
      "404": errorResponse("Not found"),
    },
  })
  delete(req: AuthenticatedRequest, _nicheSlug: string, listingSlug: string): Promise<NextResponse> {
    return this.handleResponse(async () => {
      await listingService.delete(listingSlug, req.auth.userId)
      return null
    })
  }
}

export const listingController = new ListingController()
