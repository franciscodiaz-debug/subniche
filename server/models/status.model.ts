import { z } from "zod"
import type { Status as PrismaStatus } from ".prisma/client"

export const statusPublicSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  icon: z.string(),
})

export type StatusPublic = z.infer<typeof statusPublicSchema>

export class Status implements PrismaStatus {
  id: string
  name: string
  code: string
  icon: string
  created_at: Date
  updated_at: Date

  constructor(data: PrismaStatus) {
    this.id = data.id
    this.name = data.name
    this.code = data.code
    this.icon = data.icon
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateStatusInput = {
  name: string
  code: string
  icon: string
}

export type UpdateStatusInput = Partial<CreateStatusInput>
