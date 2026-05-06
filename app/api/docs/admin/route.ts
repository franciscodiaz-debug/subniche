import { NextResponse } from "next/server"
import { adminSwaggerSpec } from "@/lib/swagger/admin-spec"

export async function GET() {
  return NextResponse.json(adminSwaggerSpec)
}
