import { prisma } from "@/lib/prisma"
import type { CreateStatusInput, UpdateStatusInput } from "@/server/models/status.model"
import type { Status } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class StatusRepository extends BaseRepository<Status, CreateStatusInput, UpdateStatusInput> {
  constructor() {
    super(prisma.status, "name", "asc")
  }
}

export const statusRepository = new StatusRepository()
