import { ApiOperation, ApiTag, dataResponse, ref } from "@/server/decorators/api.decorators"
import { attributeService } from "@/server/services/attribute.service"
import { ApiBaseController } from "./api-base.controller"

@ApiTag("Attribute")
class AttributeController extends ApiBaseController {
  @ApiOperation({
    method: "get",
    path: "/attribute",
    summary: "List all attributes grouped by type",
    responses: {
      "200": dataResponse("Success", {
        type: "object",
        additionalProperties: { type: "array", items: ref("AttributeItem") },
      }),
    },
  })
  getAll() {
    return this.handleResponse(() => attributeService.getAllGrouped())
  }
}

export const attributeController = new AttributeController()
