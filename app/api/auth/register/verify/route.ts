import { NextRequest } from "next/server"
import { authController } from "@/server/controllers/auth.controller"

export async function GET(req: NextRequest) {
  return authController.verifyEmail(req)
}
