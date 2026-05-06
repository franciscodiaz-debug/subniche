import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { exampleService } from "@/server/services/example.service"
import { createExampleSchema, updateExampleSchema } from "@/server/validators/example.validator"
import { BaseController } from "./base.controller"
import type { CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"
import type { Example } from ".prisma/client"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
}

@ApiTag("Example")
class ExampleController extends BaseController<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(exampleService, createExampleSchema, updateExampleSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/example",
    summary: "List all examples",
    responses: { "200": dataResponse("Success", { type: "array", items: ref("Example") }) },
  })
  override getAll() { return super.getAll() }

  @ApiOperation({
    method: "get",
    path: "/example/{id}",
    summary: "Get example by ID",
    parameters: [idParam],
    responses: { "200": dataResponse("Success", ref("Example")), "404": errorResponse("Not found") },
  })
  override getOne(id: string) { return super.getOne(id) }

  @ApiOperation({
    method: "post",
    path: "/example",
    summary: "Create an example",
    requestBody: jsonBody(ref("CreateExampleBody")),
    responses: { "200": dataResponse("Created", ref("Example")), "422": errorResponse("Validation error") },
  })
  override create(...args: Parameters<BaseController<Example, CreateExampleInput, UpdateExampleInput>["create"]>) {
    return super.create(...args)
  }

  @ApiOperation({
    method: "patch",
    path: "/example/{id}",
    summary: "Update example",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateExampleBody")),
    responses: { "200": dataResponse("Updated", ref("Example")), "422": errorResponse("Validation error") },
  })
  override update(...args: Parameters<BaseController<Example, CreateExampleInput, UpdateExampleInput>["update"]>) {
    return super.update(...args)
  }

  @ApiOperation({
    method: "delete",
    path: "/example/{id}",
    summary: "Delete example",
    parameters: [idParam],
    responses: { "200": errorResponse("Deleted"), "404": errorResponse("Not found") },
  })
  override delete(id: string) { return super.delete(id) }
}

export const exampleController = new ExampleController()
