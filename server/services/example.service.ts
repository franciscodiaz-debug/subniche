import { exampleRepository } from "@/server/repositories/example.repository"
import type { CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"
import type { Example } from ".prisma/client"
import { BaseService } from "./base.service"

class ExampleService extends BaseService<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(exampleRepository, "Example")
  }
}

export const exampleService = new ExampleService()
