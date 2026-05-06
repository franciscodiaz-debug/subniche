import { NextRequest } from "next/server"
import { adminSpecificationValueController } from "@/server/controllers/admin/specification-value.controller"

export async function GET(req: NextRequest) {
  return adminSpecificationValueController.getAll(req)
}

export async function POST(req: NextRequest) {
  return adminSpecificationValueController.create(req)
}
