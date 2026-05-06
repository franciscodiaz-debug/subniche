import type { OpenAPIV3 } from "openapi-types"
import type { ZodType } from "zod"

type HttpMethod = "get" | "post" | "patch" | "put" | "delete"

type OperationMeta = {
  method: HttpMethod
  path: string
  summary: string
  tags: string[]
  secured?: boolean
  parameters?: OpenAPIV3.ParameterObject[]
  requestBody?: OpenAPIV3.RequestBodyObject
  responses: Record<string, OpenAPIV3.ResponseObject>
}

// Global registry — populated when @ApiTag finalizes a controller
const operationRegistry: OperationMeta[] = []

// Pending operations per prototype — populated by @ApiOperation before @ApiTag runs
const pendingOps = new WeakMap<object, OperationMeta[]>()

// Schema registry — Zod schemas keyed by OpenAPI component name
const schemaRegistry = new Map<string, ZodType>()

export function getOperationRegistry(): OperationMeta[] {
  return operationRegistry
}

export function getSchemaRegistry(): Map<string, ZodType> {
  return schemaRegistry
}

// ---------------------------------------------------------------------------
// registerSchema — call from validator files to auto-generate components/schemas
// ---------------------------------------------------------------------------
export function registerSchema(name: string, schema: ZodType): void {
  schemaRegistry.set(name, schema)
}

// ---------------------------------------------------------------------------
// @ApiTag — class decorator
// Runs after all method decorators. Finalizes each pending operation by
// injecting the tag and moving it to the global registry.
// ---------------------------------------------------------------------------
export function ApiTag(tag: string, options?: { secured?: boolean }): ClassDecorator {
  return (target) => {
    const ops = pendingOps.get(target.prototype) ?? []
    for (const op of ops) {
      operationRegistry.push({
        ...op,
        tags: [tag],
        ...(options?.secured && !op.secured ? { secured: true } : {}),
      })
    }
  }
}

// ---------------------------------------------------------------------------
// @ApiOperation — method decorator
// Registers an operation on the prototype. Tags are resolved later by @ApiTag.
// ---------------------------------------------------------------------------
type ApiOperationOptions = {
  method: HttpMethod
  path: string
  summary: string
  secured?: boolean
  parameters?: OpenAPIV3.ParameterObject[]
  requestBody?: OpenAPIV3.RequestBodyObject
  responses: Record<string, OpenAPIV3.ResponseObject>
}

export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
  return (target, _key, descriptor) => {
    const ops = pendingOps.get(target) ?? []
    ops.push({ ...options, tags: [] })
    pendingOps.set(target, ops)
    return descriptor
  }
}

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------
export function ref(name: string): OpenAPIV3.ReferenceObject {
  return { $ref: `#/components/schemas/${name}` }
}

export function jsonBody(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.RequestBodyObject {
  return { required: true, content: { "application/json": { schema } } }
}

export function jsonResponse(
  description: string,
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.ResponseObject {
  return { description, content: { "application/json": { schema } } }
}

export function dataResponse(
  description: string,
  dataSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.ResponseObject {
  return jsonResponse(description, {
    allOf: [ref("ApiResponse"), { properties: { data: dataSchema } }],
  })
}

export function errorResponse(description: string): OpenAPIV3.ResponseObject {
  return jsonResponse(description, ref("ErrorResponse"))
}
