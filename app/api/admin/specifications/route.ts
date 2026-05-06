import { NextRequest } from "next/server"
import { adminSpecificationController } from "@/server/controllers/admin/specification.controller"

export async function GET(req: NextRequest) {
  return adminSpecificationController.getAll(req)
}

export async function POST(req: NextRequest) {
  return adminSpecificationController.create(req)
}
