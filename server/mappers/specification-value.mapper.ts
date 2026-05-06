import type { SpecificationValue } from ".prisma/client"
import type { SpecificationValueAdminPublic } from "@/server/models/specification-value.model"

export const SpecificationValueAdminMapper = {
  toPublic({ bitpos: _b, ...rest }: SpecificationValue): SpecificationValueAdminPublic {
    return rest
  },
}
