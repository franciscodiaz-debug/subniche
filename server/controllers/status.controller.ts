import { ApiOperation, ApiTag, dataResponse, ref } from "@/server/decorators/api.decorators"
import { statusService } from "@/server/services/status.service"
import { ApiBaseController } from "./api-base.controller"

@ApiTag("Status")
class StatusController extends ApiBaseController {
  @ApiOperation({
    method: "get",
    path: "/status",
    summary: "List all statuses",
    responses: { "200": dataResponse("Success", { type: "array", items: ref("Status") }) },
  })
  getAll() {
    return this.handleResponse(() => statusService.getAll())
  }
}

export const statusController = new StatusController()
