import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { userIdentityService } from "@/server/services/user-identity.service"
import { createUserIdentitySchema, updateUserIdentitySchema } from "@/server/validators/user-identity.validator"
import { BaseController } from "./base.controller"
import type { CreateUserIdentityInput, UpdateUserIdentityInput } from "@/server/models/user-identity.model"
import type { UserIdentity } from ".prisma/client"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
}

@ApiTag("UserIdentity")
class UserIdentityController extends BaseController<UserIdentity, CreateUserIdentityInput, UpdateUserIdentityInput> {
  constructor() {
    super(userIdentityService, createUserIdentitySchema, updateUserIdentitySchema)
  }

  @ApiOperation({
    method: "get",
    path: "/user-identity",
    summary: "List all user identities",
    responses: { "200": dataResponse("Success", { type: "array", items: ref("UserIdentity") }) },
  })
  override getAll() { return super.getAll() }

  @ApiOperation({
    method: "get",
    path: "/user-identity/{id}",
    summary: "Get user identity by ID",
    parameters: [idParam],
    responses: { "200": dataResponse("Success", ref("UserIdentity")), "404": errorResponse("Not found") },
  })
  override getOne(id: string) { return super.getOne(id) }

  @ApiOperation({
    method: "post",
    path: "/user-identity",
    summary: "Create a user identity",
    requestBody: jsonBody(ref("CreateUserIdentityBody")),
    responses: { "200": dataResponse("Created", ref("UserIdentity")), "422": errorResponse("Validation error") },
  })
  override create(...args: Parameters<BaseController<UserIdentity, CreateUserIdentityInput, UpdateUserIdentityInput>["create"]>) {
    return super.create(...args)
  }

  @ApiOperation({
    method: "patch",
    path: "/user-identity/{id}",
    summary: "Update user identity",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateUserIdentityBody")),
    responses: { "200": dataResponse("Updated", ref("UserIdentity")), "422": errorResponse("Validation error") },
  })
  override update(...args: Parameters<BaseController<UserIdentity, CreateUserIdentityInput, UpdateUserIdentityInput>["update"]>) {
    return super.update(...args)
  }

  @ApiOperation({
    method: "delete",
    path: "/user-identity/{id}",
    summary: "Delete user identity",
    parameters: [idParam],
    responses: { "200": errorResponse("Deleted"), "404": errorResponse("Not found") },
  })
  override delete(id: string) { return super.delete(id) }
}

export const userIdentityController = new UserIdentityController()
