import { NextRequest } from "next/server"
import { authController } from "@/server/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return authController.initiateRegistration(req)
}
