import { NextRequest } from "next/server"
import { ApiOperation, ApiTag, dataResponse, errorResponse, jsonBody, ref } from "@/server/decorators/api.decorators"
import { authService } from "@/server/services/auth.service"
import {
  initiateRegisterBodySchema,
  verifyEmailQuerySchema,
  completeRegisterBodySchema,
  loginBodySchema,
  CompleteRegisterBody,
  LoginBody,
} from "@/server/validators/auth.validator"
import { unprocessable } from "@/server/utils/response"
import { ZodType } from "zod"
import { Validate, ValidatedRequest } from "../middleware/validate.middleware"
import { ApiBaseController } from "./api-base.controller"
import "@/lib/email"

@ApiTag("Auth")
class AuthController extends ApiBaseController {
  constructor(
    protected readonly completeRegisterBodySchema: ZodType<CompleteRegisterBody>,
    protected readonly loginBodySchema: ZodType<LoginBody>,
  ) {
    super()
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  @ApiOperation({
    method: "post",
    path: "/auth/register/initiate",
    summary: "Start registration: send a verification email to the given address",
    requestBody: jsonBody(ref("InitiateRegisterBody")),
    responses: {
      "202": dataResponse("Verification email sent", ref("InitiateRegisterBody")),
      "409": errorResponse("Email already registered"),
      "422": errorResponse("Validation error"),
    },
  })
  async initiateRegistration(req: NextRequest) {
    const body = await req.json()
    const parsed = initiateRegisterBodySchema.safeParse(body)
    if (!parsed.success) return unprocessable(parsed.error.message)

    return this.handleResponse(async () => {
      const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`
      return await authService.initiateRegistration(parsed.data!, baseUrl)
    }, 202)
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  @ApiOperation({
    method: "get",
    path: "/auth/register/verify",
    summary: "Verify the email address using the token received by email",
    parameters: [{ in: "query", name: "token", required: true, schema: { type: "string" } }],
    responses: {
      "200": dataResponse("Email verified", ref("VerifyEmailResponse")),
      "400": errorResponse("Token already used or expired"),
      "404": errorResponse("Invalid token"),
      "422": errorResponse("Validation error"),
    },
  })
  async verifyEmail(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token")
    const parsed = verifyEmailQuerySchema.safeParse({ token })
    if (!parsed.success) return unprocessable(parsed.error.message)

    return this.handleResponse(() => authService.verifyEmailToken(parsed.data.token))
  }

  // ── Step 3 ─────────────────────────────────────────────────────────────────

  @ApiOperation({
    method: "post",
    path: "/auth/register/complete",
    summary: "Complete registration: set password and create the user account",
    requestBody: jsonBody(ref("CompleteRegisterBody")),
    responses: {
      "201": dataResponse("User created", ref("CompleteRegisterResponse")),
      "400": errorResponse("Email not verified or token expired"),
      "404": errorResponse("Invalid token"),
      "409": errorResponse("Email already registered"),
      "422": errorResponse("Validation error"),
    },
  })
  @Validate((self) => (self as unknown as AuthController).completeRegisterBodySchema)
  async completeRegistration(req: NextRequest) {
    const { validated } = req as ValidatedRequest<CompleteRegisterBody>
    return this.handleResponse(() => authService.completeRegistration(validated), 201)
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  @ApiOperation({
    method: "post",
    path: "/auth/login",
    summary: "Login with any provider identity",
    requestBody: jsonBody(ref("LoginUserBody")),
    responses: {
      "200": dataResponse("User logged in", ref("LoginUserResponse")),
      "401": errorResponse("Invalid credentials"),
      "422": errorResponse("Validation error"),
      "500": errorResponse("Internal server error"),
    },
  })
  @Validate((self) => (self as unknown as AuthController).loginBodySchema)
  async login(req: NextRequest) {
    const { validated } = req as ValidatedRequest<LoginBody>
    return this.handleResponse(() => authService.login(validated))
  }
}

export const authController = new AuthController(
  completeRegisterBodySchema,
  loginBodySchema
)
