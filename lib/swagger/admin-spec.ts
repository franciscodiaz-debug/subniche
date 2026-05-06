// Admin-only OpenAPI spec. Only operations tagged with "Admin / *" are included.
// Import admin controllers here so their @ApiOperation decorators register.

import "@/server/controllers/admin/category.controller"
import "@/server/validators/category.validator"
import "@/server/controllers/admin/niche.controller"
import "@/server/validators/niche.validator"
import "@/server/controllers/admin/specification.controller"
import "@/server/validators/specification.validator"
import "@/server/controllers/admin/specification-value.controller"
import "@/server/validators/specification-value.validator"
import "@/server/controllers/admin/specification-category-value.controller"
import "@/server/validators/specification-category-value.validator"

import type { OpenAPIV3 } from "openapi-types"
import { buildSchemas, buildPaths, securitySchemes } from "./spec"

const paths = buildPaths("Admin")

export const adminSwaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "SubNiche Admin API",
    version: "1.0.0",
    description: "Admin-only endpoints — requires admin or superadmin role",
  },
  servers: [{ url: "/api", description: "Local development" }],
  components: {
    securitySchemes,
    schemas: buildSchemas(paths),
  },
  paths,
}
