import { prisma } from "@/lib/prisma"
import type { CreateAttributeInput, UpdateAttributeInput } from "@/server/models/attribute.model"
import type { Attribute } from ".prisma/client"
import { BaseRepository } from "./base.repository"

class AttributeRepository extends BaseRepository<Attribute, CreateAttributeInput, UpdateAttributeInput> {
  constructor() {
    super(prisma.attribute)
  }

  override findAll(): Promise<Attribute[]> {
    return prisma.attribute.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
    })
  }
}

export const attributeRepository = new AttributeRepository()
