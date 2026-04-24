import { z } from "zod"
// localhost:300/api/books?page=2&limit=10&sort=title:desc&q=clean

export const bookListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["createdAt:desc","createdAt:asc","price:asc","price:desc","title:asc"]).default("createdAt:desc"),
    q: z.string().min(1).max(100).optional()
})

export type BookListQuery= z.infer<typeof bookListQuerySchema>

export const bookCreateSchema = z.object({
    title : z.string().min(2,"Le titre doit avoir au moins deux caractere").max(100),    
    author : z.string().min(2,"Le nom de l'auteur doit avoir au moins deux caractere").max(100),     
    pages : z.coerce.number().int().positive("Les pages > 0"),   
    price : z.coerce.number().int().nonnegative("Le prix ne peut pas etre negatif"),         
    inStock : z.coerce.number().int().nonnegative().default(0),  
})

export type BookCreateInput = z.infer<typeof bookCreateSchema>

export const bookIdSchema = z.string().min(25).max(25).regex(/^c[a-z0-9]+$/,"ID Invalide")

export const bookUpdateSchema = bookCreateSchema.partial().extend({
    version: z.coerce.number().int().nonnegative(),
})