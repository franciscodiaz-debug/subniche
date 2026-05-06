import { NextRequest } from "next/server"
import { adminNicheController } from "@/server/controllers/admin/niche.controller"

export async function GET(req: NextRequest) {
  return adminNicheController.getAll(req)
}

export async function POST(req: NextRequest) {
  return adminNicheController.create(req)
}
