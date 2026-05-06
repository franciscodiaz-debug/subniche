import { NextRequest } from "next/server"
import { categoryController } from "@/server/controllers/category.controller"

type Params = { params: Promise<{ nicheSlug: string; categorySlug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { nicheSlug, categorySlug } = await params
  return categoryController.getByNicheAndSlug(nicheSlug, categorySlug)
}
