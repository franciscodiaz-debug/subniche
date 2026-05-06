import type { Status } from ".prisma/client"
import type { StatusPublic } from "@/server/models/status.model"

export const StatusMapper = {
  toPublic({ id, name, code, icon }: Status): StatusPublic {
    return { id, name, code, icon }
  },
}
