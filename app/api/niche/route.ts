import { nicheController } from "@/server/controllers/niche.controller"

export async function GET() {
  return nicheController.getAll()
}
