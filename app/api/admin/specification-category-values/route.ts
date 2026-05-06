import { NextRequest } from "next/server"
import { adminSpecificationCategoryValueController } from "@/server/controllers/admin/specification-category-value.controller"

export async function GET(req: NextRequest) {
  return adminSpecificationCategoryValueController.getAll(req)
}

export async function POST(req: NextRequest) {
  return adminSpecificationCategoryValueController.create(req)
}
