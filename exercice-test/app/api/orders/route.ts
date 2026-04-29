import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { orderCreateSchema } from "@/schemas/order";
import { stripe } from "@/utils/stripe";

export async function POST(req: Request){
    let raw: unknown

    try{
        raw = await req.json()
    }catch{
        return NextResponse.json({ok : false, error: "JSON Invalide"}, {status:400})
    }


    const parsed = orderCreateSchema.safeParse(raw)
    if(!parsed.success){
        return NextResponse.json(
            {ok: false, error: "Validation echouee", details: parsed.error.flatten().fieldErrors},
            {status:422}
        )
    }

    const { bookId, quantity } = parsed.data

    // (a) trouve le livre qu'on veut acheter
    const book = await prisma.book.findUnique({ where: {id: bookId} })
    if(!book){
        return NextResponse.json({ok: false, error:"Book pas trouve"},{status:404}) // ROLLBACK
    }

    // (b) verification de la quantite 
    if(book.inStock < quantity){
        return NextResponse.json(
                {ok: false, error:"Stock insuffisant !"},
                {status:409} // 409 : Etat de la ressource qui ne permet pas de continuer la transaction
            )
    }

    const total = book.price * quantity
    const order = await prisma.order.create({
        data:{bookId, quantity, total, status:"pending"},
    })

    const intent = await stripe.paymentIntents.create({
        amount: total,
        currency: "cad",
        automatic_payment_methods : {enabled: true}, // Confirmation
        metadata: {orderId : order.id}
    })

    //await stripe.paymentIntents.capture() // Capture

    await prisma.order.update({
        where: {id: order.id},
        data: {stripePaymentIntentId : intent.id}
    })

    return NextResponse.json(
        {ok: true, data: { orderId: order.id , clientSecret : intent.client_secret }}, {status:201}
    )

    /*
    try{
        const Myorder = await prisma.$transaction(async(tx) => {
            // (a) trouve le livre qu'on veut acheter
            const book = await tx.book.findUnique({ where: {id: bookId} })
            if(!book){
                throw new Error("Book pas trouve") // ROLLBACK
            }

            // (b) verification de la quantite 
            if(book.inStock < quantity){
                throw new Error("Stock insuffisant ! pour ce livre")
            }

            // (c) reserve la quantite qu'on veut acheter 
            await tx.book.update({
                where: {id : bookId},
                data: {inStock:{decrement: quantity}}
            })

            // (d) creation de la commande 
            await tx.order.create({
                data: {
                    bookId, 
                    quantity,
                    total : book.price * quantity
                }
            })
        })
        return NextResponse.json(
                {ok: true, data: Myorder},
                {status: 201}
            )
    }catch(e:any){
        if(e.message === "Book pas trouve"){
            return NextResponse.json(
                {ok: false, error:"Livre introuvable"},
                {status:404}
            )
        }

        if(e.message === "Stock insuffisant ! pour ce livre"){
            return NextResponse.json(
                {ok: false, error:"Stock insuffisant !"},
                {status:409} // 409 : Etat de la ressource qui ne permet pas de continuer la transaction
            )
        }

        console.error(e)
        return NextResponse.json(
            {ok: false, error: "Erreur interne"},
            {status:500}
        )
    
    }*/


}