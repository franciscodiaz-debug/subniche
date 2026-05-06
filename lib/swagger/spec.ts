// OpenAPI 3.0 specification.
// Schemas are generated automatically from Zod validators via registerSchema().
// Paths are collected automatically from @ApiOperation decorators on controllers.
// Import all controllers (and validators) here so their side-effects register first.

import "@/server/controllers/auth.controller"
import "@/server/validators/auth.validator"
import "@/server/controllers/niche.controller"
import "@/server/controllers/location.controller"
import "@/server/validators/location.validator"
import "@/server/controllers/status.controller"
import "@/server/validators/status.validator"
import "@/server/controllers/attribute.controller"
import "@/server/validators/attribute.validator"
import "@/server/controllers/category.controller"
import "@/server/validators/category.validator"
import "@/server/controllers/media.controller"
import "@/server/validators/media.validator"
import "@/server/controllers/listing.controller"
import "@/server/validators/listing.validator"
import "@/server/controllers/niche-profile.controller"
import "@/server/validators/niche-profile.validator"

import { z } from "zod"
import type { OpenAPIV3 } from "openapi-types"
import { getOperationRegistry, getSchemaRegistry } from "@/server/decorators/api.decorators"

export const securitySchemes: OpenAPIV3.ComponentsObject["securitySchemes"] = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Supabase JWT token",
  },
}

function collectSchemaRefs(obj: unknown): Set<string> {
  const names = new Set<string>()
  const visit = (val: unknown) => {
    if (!val || typeof val !== "object") return
    if (Array.isArray(val)) { val.forEach(visit); return }
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (k === "$ref" && typeof v === "string") {
        const match = v.match(/^#\/components\/schemas\/(.+)$/)
        if (match) names.add(match[1])
      } else {
        visit(v)
      }
    }
  }
  visit(obj)
  return names
}

export function buildPaths(tagPrefix?: string): OpenAPIV3.PathsObject {
  const paths: OpenAPIV3.PathsObject = {}
  for (const op of getOperationRegistry()) {
    if (tagPrefix && !op.tags.some((t) => t.startsWith(tagPrefix))) continue
    if (!paths[op.path]) paths[op.path] = {}
    const pathItem = paths[op.path] as OpenAPIV3.PathItemObject
    pathItem[op.method] = {
      summary: op.summary,
      tags: op.tags,
      ...(op.secured ? { security: [{ bearerAuth: [] }] } : {}),
      ...(op.parameters ? { parameters: op.parameters } : {}),
      ...(op.requestBody ? { requestBody: op.requestBody } : {}),
      responses: op.responses,
    }
  }
  return paths
}

export function buildSchemas(paths: OpenAPIV3.PathsObject): Record<string, OpenAPIV3.SchemaObject> {
  const all: Record<string, OpenAPIV3.SchemaObject> = {
    ApiResponse: {
      type: "object",
      properties: {
        data: {},
        error: { type: "string", nullable: true },
      },
    },
    ErrorResponse: {
      type: "object",
      properties: {
        data: { nullable: true, default: null },
        error: { type: "string" },
      },
    },
  }

  for (const [name, zodSchema] of getSchemaRegistry()) {
    all[name] = z.toJSONSchema(zodSchema) as OpenAPIV3.SchemaObject
  }

  // Collect schema names reachable from paths (transitive $ref resolution)
  const reachable = new Set<string>()
  const queue = [...collectSchemaRefs(paths)]
  while (queue.length) {
    const name = queue.shift()!
    if (reachable.has(name)) continue
    reachable.add(name)
    if (all[name]) {
      for (const nested of collectSchemaRefs(all[name])) {
        if (!reachable.has(nested)) queue.push(nested)
      }
    }
  }

  return Object.fromEntries(Object.entries(all).filter(([name]) => reachable.has(name)))
}

const paths = buildPaths()

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "SubNiche API",
    version: "1.0.0",
    description: "REST API powered by Next.js 15 + Supabase",
  },
  servers: [{ url: "/api", description: "Local development" }],
  components: {
    securitySchemes,
    schemas: buildSchemas(paths),
  },
  paths,
}
