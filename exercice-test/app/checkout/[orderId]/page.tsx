"use client"

import  CheckoutForm  from "@/components/CheckoutForm"
import { useState , useEffect } from "react"

export default function CheckoutPage(){

    const [ clientSecret, setClientSecret ] = useState<string | null>(null)
    useEffect(()=>{
        setClientSecret(new URLSearchParams(window.location.search).get("cs"))
    },[])

    if(!clientSecret) return <p>Chargement ...</p>
    return(
        <>
        <h1>Paiement de commande</h1>
        <CheckoutForm clientSecret={clientSecret}/>
        </>
    )
}