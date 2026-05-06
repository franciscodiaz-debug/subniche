import { attributeRepository } from "@/server/repositories/attribute.repository"
import type { CreateAttributeInput, UpdateAttributeInput, GroupedAttributes } from "@/server/models/attribute.model"
import { AttributeMapper } from "@/server/mappers/attribute.mapper"
import type { Attribute } from ".prisma/client"
import { BaseService } from "./base.service"

class AttributeService extends BaseService<Attribute, CreateAttributeInput, UpdateAttributeInput> {
  constructor() {
    super(attributeRepository, "Attribute")
  }

  async getAllGrouped(): Promise<GroupedAttributes> {
    const all = await attributeRepository.findAll()
    return AttributeMapper.toGrouped(all)
  }
}

export const attributeService = new AttributeService()
