


export type fake_user = { id: string, role : "USER" | "ADMIN" } | null
/*
* la session : header HTTP "x-fake-user" (Ca existe seulement pour le developpement JAMAIS EN PRODUCTION)
* Format : Sonia:ADMIN | Sebastien:USER
* Retourne null si le header est absent ou mal former

*/
export function readFakeUser(req:Request): fake_user{
    const header = req.headers.get("x-fake-user")
    if(!header) return null
    // Sonia:ADMIN ==> ["Sonia","ADMIN"]
    const [ id, role ] = header.split(":")

    if(role !== "ADMIN" && role !== "USER") return null

    return { id , role}
}