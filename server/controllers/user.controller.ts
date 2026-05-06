import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { userService } from "@/server/services/user.service"
import { createUserSchema, updateUserSchema } from "@/server/validators/user.validator"
import { BaseController } from "./base.controller"
import type { CreateUserInput, UpdateUserInput } from "@/server/models/user.model"
import type { User } from ".prisma/client"
import type { UserPublic } from "@/server/models/user.model"

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, format: "uuid" },
}

@ApiTag("User")
class UserController extends BaseController<User, CreateUserInput, UpdateUserInput, UserPublic> {
  constructor() {
    super(userService, createUserSchema, updateUserSchema)
  }

  @ApiOperation({
    method: "get",
    path: "/user",
    summary: "List all users",
    responses: { "200": dataResponse("Success", { type: "array", items: ref("User") }) },
  })
  override getAll() { return super.getAll() }

  @ApiOperation({
    method: "get",
    path: "/user/{id}",
    summary: "Get user by ID",
    parameters: [idParam],
    responses: { "200": dataResponse("Success", ref("User")), "404": errorResponse("Not found") },
  })
  override getOne(id: string) { return super.getOne(id) }

  @ApiOperation({
    method: "post",
    path: "/user",
    summary: "Create a user",
    requestBody: jsonBody(ref("CreateUserBody")),
    responses: { "200": dataResponse("Created", ref("User")), "422": errorResponse("Validation error") },
  })
  override create(...args: Parameters<BaseController<User, CreateUserInput, UpdateUserInput>["create"]>) {
    return super.create(...args)
  }

  @ApiOperation({
    method: "patch",
    path: "/user/{id}",
    summary: "Update user",
    parameters: [idParam],
    requestBody: jsonBody(ref("UpdateUserBody")),
    responses: { "200": dataResponse("Updated", ref("User")), "422": errorResponse("Validation error") },
  })
  override update(...args: Parameters<BaseController<User, CreateUserInput, UpdateUserInput>["update"]>) {
    return super.update(...args)
  }

  @ApiOperation({
    method: "delete",
    path: "/user/{id}",
    summary: "Delete user",
    parameters: [idParam],
    responses: { "200": errorResponse("Deleted"), "404": errorResponse("Not found") },
  })
  override delete(id: string) { return super.delete(id) }
}

export const userController = new UserController()
