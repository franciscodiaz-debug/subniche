import { ApiOperation, ApiTag, dataResponse, errorResponse, ref } from "@/server/decorators/api.decorators"
import { locationService } from "@/server/services/location.service"
import { BaseController } from "./base.controller"
import { NextResponse } from "next/server"
import { z } from "zod"
import { locationRequestSchema } from "../validators/location.validator"
import { ValidationError } from "../errors/client.error"

const zipParam = {
  name: "zip_code",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
  description: "The zip code of the location",
}

@ApiTag("Location")
class LocationController extends BaseController<never, never, never> {
  constructor() {
    super(null as never, z.never(), z.never())
  }

  @ApiOperation({
    method: "get",
    path: "/location/{zip_code}",
    summary: "Get location by zip code",
    parameters: [zipParam],
    responses: {
      "200": dataResponse("Success", ref("LocationResponse")),
      "404": errorResponse("Not found"),
    },
  })
  getByZipCode(zip_code: string): Promise<NextResponse> {
    const validated = locationRequestSchema.safeParse(zip_code)
    if (!validated.success) {
      throw new ValidationError(validated.error.message)
    }
    return this.handleResponse(() => locationService.getByZipCode(validated.data.zip_code))
  }
}

export const locationController = new LocationController()
