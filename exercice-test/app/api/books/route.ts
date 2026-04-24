import { NextResponse } from "next/server";

import prisma from "@/utils/prisma"
import { bookCreateSchema, bookListQuerySchema } from "@/schemas/book"
import { error } from "console";

// localhost:300/api/books?page=abc&limit=10&sort=title:desc&q=clean

export async function GET(req: Request){
  // SELECT * from Book
  // extraire les query params a partir de URL 
  const { searchParams } = new URL(req.url)
  // {page : "2" , limit : "10" ....}
  const parsed = bookListQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  )

  if(!parsed.success){
    return NextResponse.json(
      {ok: false,
        error: "Parametre de requete invalide",
        details: parsed.error.flatten().fieldErrors,
      },
      {status : 422}, // Unprecessable Request : syntaxe elle est correct mais ca viole les regles du validateur
    )
  }

  const { page, limit, sort, q } = parsed.data

  const [ field, direction ] = sort.split(":") as [string, "asc" | "desc"]
  const orderBy = { [field]: direction }

  const where = q ? {OR:[{title: { contains:q}},{author:{contains:q}}]} : {}

  const skip = (page - 1) * limit


  //where:{OR:[{title: { contains:q}},{author:{contains:q}}]} // SELECT * From book WHERE q= ? OrderBy (orderby)

  const [items, total] = await prisma.$transaction([
    prisma.book.findMany({where, skip, take:limit, orderBy}),
    // -- Maxime Update de 100 livre 
    prisma.book.count({ where }),
  ])


  return NextResponse.json(
    {
    ok : true, 
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit), sort }
  }  )

}


export async function POST(req: Request){
  let raw: unknown 
  try{
    raw = await req.json()
  }catch{
    return NextResponse.json(
      {ok: false,
      error: "JSON Invalide"},
      {status: 400}
    )
  }

  const parsed = bookCreateSchema.safeParse(raw)
  if(!parsed.success){
    return NextResponse.json(
      {ok: false, 
        error: "Validation echouee", 
        details: parsed.error.flatten().fieldErrors},
      {status:422})
  }

  const created = await prisma.book.create({
    data: parsed.data
  })

  return NextResponse.json(
    {ok: true, data:created},
    {status: 201} 
  )
}



// localhost:3000/api/book/[id]
export async function DELETE(req:Request, { params }: number ){

  // 1 . Valider le parametre (ID) : que c'est un cuid (Syntaxe)
  // 2 . Verifier si le livre existe (monlivre = await prisma.book.findUnique) 
  // 3 . Suppression (await prisma.book.delete)

}
