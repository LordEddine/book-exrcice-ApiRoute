import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { bookIdSchema, bookUpdateSchema } from "@/schemas/book";

// localhost:3000/api/book/[id]

type monId = { params : { id: string}}


export async function GET(_req: Request, {params}: monId){
    const idCheck = bookIdSchema.safeParse(params.id) // safeParse = {success : bool, error}
    // Checker l'erreur 400 - (si Id bien ecrit)
    if(!idCheck.success){
        return NextResponse.json(
            {ok: false, error: "Format de ID Invalide"},
            {status: 400}
        )
    }
    // Checker l'erreur 404 - si le livre existe dans la BDD
    const book = await prisma.book.findUnique({
        where:{id:idCheck.data}
    })

    if(!book){
        return NextResponse.json(
            {ok:false, error:"Livre introuvable"},
            {status: 404}
        )
    }

    // Si tout va bien : 
    return NextResponse.json({ok:true, data:book}, {status:200})

}

export async function DELETE(_req: Request, {params}: monId) {
	const idCheck = bookIdSchema.safeParse(params.id);		//safeParse = {success: bool, error}
 
	if (!idCheck.success) {
		return NextResponse.json(
			{ok: false, error: "Format ID Invalide"},
			{status: 400}
		)
	}
 
	const book = await prisma.book.findUnique({
		where: {id: idCheck.data}
	});
 
	if (!book) {
		return NextResponse.json(
			{ok: false, error: "Livre Introuvable"},
			{status: 404}
		)
	}
 
	await prisma.book.delete({
		where: {id: idCheck.data}
	})
 
	return new NextResponse(
		null,
		{status: 204}
	);
}

export async function PATCH(req:Request, { params }: monId){
    const idCheck = bookIdSchema.safeParse(params.id) // safeParse = {success : bool, error}
    // Checker l'erreur 400 - (si Id bien ecrit)
    if(!idCheck.success){
        return NextResponse.json(
            {ok: false, error: "Format de ID Invalide"},
            {status: 400}
        )
    }
    // verification que le JsON est bien ecrit !
    let raw: unknown
    try{
        raw = await req.json()
    }catch{
        return NextResponse.json(
            {ok: false, error:"JSON mal ecrit"},{status:400}
        )
    }
    // validation de la logique des donnees
    const parsed = bookUpdateSchema.safeParse(raw)
    if(!parsed.success){
        return NextResponse.json(
            {ok: false, error : "Validation Echouee", details:parsed.error.flatten().fieldErrors},
            {status: 422}
        )
    }

    // Checker l'erreur 404 - si le livre existe dans la BDD
    const book = await prisma.book.findUnique({
        where:{id:idCheck.data}
    })

    if(!book){
        return NextResponse.json(
            {ok:false, error:"Livre introuvable"},
            {status: 404}
        )
    }

    /// update a ce niveau la 

    const { version, ...changes } = parsed.data
    const id = idCheck.data
  
    const resultat = await prisma.book.updateMany({
        where : { id, version },
        data : { ...changes, 
            version : {increment: 1}}  // Verrou applique sur Version
    })

    if (resultat.count === 0 ){
        return NextResponse.json(
            {ok :false,error: "Conflit de version",version_actuelle:book.version},
            {status:409}
        )
    }

    return NextResponse.json({ok: true, data:resultat})
}