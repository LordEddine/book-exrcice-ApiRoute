import { NextRequest, NextResponse } from "next/server";


export function middleware(req:NextRequest){
    const requestID = crypto.randomUUID()

    const fakeuser = req.headers.get("x-fake-user")
    const methodes = ["POST","PUT","PATCH","DELETE"].includes(req.method)

    if(!fakeuser && methodes){
        return NextResponse.json(
            {ok:false, error:"Veuillez vous connectez !", requestID},
            {status: 401}
        )
    }

    if(fakeuser && methodes && !fakeuser.endsWith(":ADMIN")){
        return NextResponse.json(
            {ok:false, error: "Vous n'etes pas admin acces refuse !",requestID},
            {status: 403}
        )
    }

    const resultat = NextResponse.next()
    resultat.headers.set("x-request-id",requestID)
    return resultat
}
/* POST localhost:300/api/books 
    PATCH localhost:3000/api/books/[id]
    DELETE localhost:3000/api/books/[id]

*/
export const config = {
    matcher : ["/api/books/:path*"],
}