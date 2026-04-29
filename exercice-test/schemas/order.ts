import { z } from "zod"
import { bookIdSchema } from "./book"

export const orderCreateSchema = z.object({

    bookId: bookIdSchema,

    quantity : z.number().int().positive().max(10,"Maximum 10 par commande"),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>