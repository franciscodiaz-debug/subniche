import { attributeController } from "@/server/controllers/attribute.controller"

export async function GET() {
  return attributeController.getAll()
}
