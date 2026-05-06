import { prisma } from "@/lib/prisma"
import type { CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"
import type { Example } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class ExampleRepository extends BaseRepository<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(prisma.example)
  }
}

export const exampleRepository = new ExampleRepository()
