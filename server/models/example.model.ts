import type { Example as PrismaExample } from ".prisma/client"

export class Example implements PrismaExample {
  id: string
  title: string
  description: string | null
  created_at: Date
  updated_at: Date

  constructor(data: PrismaExample) {
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type CreateExampleInput = {
  title: string
  description?: string | null
}
export type UpdateExampleInput = Partial<CreateExampleInput>
