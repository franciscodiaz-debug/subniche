import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

export const createExampleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).nullable().optional(),
})

export const updateExampleSchema = createExampleSchema.partial()

export const exampleSchema = createExampleSchema.extend({
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

registerSchema("Example", exampleSchema)
registerSchema("CreateExampleBody", createExampleSchema)
registerSchema("UpdateExampleBody", updateExampleSchema)

export type CreateExampleBody = z.infer<typeof createExampleSchema>
export type UpdateExampleBody = z.infer<typeof updateExampleSchema>
