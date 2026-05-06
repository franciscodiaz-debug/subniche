// Route Handler — the entry point for /api/example
// Thin layer: delegates all logic to the controller.

import { NextRequest } from "next/server"
import { exampleController } from "@/server/controllers/example.controller"

export async function GET() {
  return exampleController.getAll()
}

export async function POST(req: NextRequest) {
  return exampleController.create(req)
}
