import { NextRequest } from "next/server"
import { adminCategoryController } from "@/server/controllers/admin/category.controller"

export async function GET(req: NextRequest) {
  return adminCategoryController.getAll(req)
}

export async function POST(req: NextRequest) {
  return adminCategoryController.create(req)
}
