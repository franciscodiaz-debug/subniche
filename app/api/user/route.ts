import { NextRequest } from "next/server"
import { userController } from "@/server/controllers/user.controller"

export async function GET() {
  return userController.getAll()
}

export async function POST(req: NextRequest) {
  return userController.create(req)
}
