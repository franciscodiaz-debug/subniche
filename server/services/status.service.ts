import { statusRepository } from "@/server/repositories/status.repository"
import type { CreateStatusInput, UpdateStatusInput, StatusPublic } from "@/server/models/status.model"
import { StatusMapper } from "@/server/mappers/status.mapper"
import type { Status } from ".prisma/client"
import { BaseService } from "./base.service"

class StatusService extends BaseService<Status, CreateStatusInput, UpdateStatusInput, StatusPublic> {
  constructor() {
    super(statusRepository, "Status", StatusMapper)
  }
}

export const statusService = new StatusService()
