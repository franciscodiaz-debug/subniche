import { NextRequest } from "next/server"
import { ZodType } from "zod"
import { unprocessable } from "@/server/utils/response"
import { getLogger } from "../utils/logger"

export type ValidatedRequest<T> = NextRequest & { validated: T }

type SchemaArg = ZodType | ((self: unknown) => ZodType)

export function Validate(schema: SchemaArg): MethodDecorator {
  return function (_target: object, _key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = async function (req: NextRequest, ...args: unknown[]) {
      const resolved = typeof schema === "function" ? schema(this) : schema
      const body = await req.json()
      getLogger().info("body", JSON.stringify(body))
      const parsed = resolved.safeParse(body)
      if (!parsed.success) {
        return unprocessable(parsed.error.issues.map(i => `${i.path.join(".")}| ${i.message}`).join(".\n "))
      }
      ;(req as ValidatedRequest<typeof parsed.data>).validated = parsed.data
      return original.call(this, req, ...args)
    }
    return descriptor
  }
}
