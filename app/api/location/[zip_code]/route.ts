import { NextRequest } from "next/server"
import { locationController } from "@/server/controllers/location.controller"

type Params = { params: Promise<{ zip_code: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { zip_code } = await params
  return locationController.getByZipCode(zip_code)
}
