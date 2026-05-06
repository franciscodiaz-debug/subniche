import { statusController } from "@/server/controllers/status.controller"

export async function GET() {
  return statusController.getAll()
}
