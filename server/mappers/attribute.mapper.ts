import type { Attribute } from ".prisma/client"
import type { AttributeItem, GroupedAttributes } from "@/server/models/attribute.model"

export const AttributeMapper = {
  toPublic({ id, name, code, allow_values }: Attribute): AttributeItem {
    return { id, name, code, allow_values }
  },

  toGrouped(entities: Attribute[]): GroupedAttributes {
    return entities.reduce<GroupedAttributes>((acc, attr) => {
      if (!acc[attr.type]) acc[attr.type] = []
      acc[attr.type].push(AttributeMapper.toPublic(attr))
      return acc
    }, {})
  },
}
