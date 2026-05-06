import type { Category } from ".prisma/client"
import type { CategoryPublic, CategoryAdminPublic } from "@/server/models/category.model"

export const CategoryAdminMapper = {
  toPublic({ bitpos: _b, ...rest }: Category): CategoryAdminPublic {
    return rest
  },
}

// Sorts each sibling group by its own `order` value independently.
// `order` is relative within a parent, not global across the whole tree.
const sortSiblings = (nodes: CategoryPublic[]): void => {
  nodes.sort((a, b) => a.order - b.order)
  for (const node of nodes) sortSiblings(node.children)
}

export const CategoryMapper = {
  toPublic({ id, title, slug, order }: Category): CategoryPublic {
    return { id, title, slug, order, children: [] }
  },

  toTree(entities: Category[]): CategoryPublic[] {
    const map = new Map<string, CategoryPublic>()
    for (const entity of entities) {
      map.set(entity.id, CategoryMapper.toPublic(entity))
    }
    const roots: CategoryPublic[] = []
    for (const entity of entities) {
      const node = map.get(entity.id)!
      if (entity.parent_id && map.has(entity.parent_id)) {
        map.get(entity.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    }
    sortSiblings(roots)
    return roots
  },
}
