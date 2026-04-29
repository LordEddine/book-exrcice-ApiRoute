"use client"

import { useState } from "react"
import { getStripe } from "@/libs/stripe-client"
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js"


function PaymentForm(){
    const elements = useElements()
    const stripe = useStripe()
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    
    async function onSubmit(e : React.FormEvent){
        e.preventDefault()
        
        if(!stripe || !elements) return

        setLoading(true)
        setError(null)

        // si la confirmation de payement 
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams : { // Fontion predefinit
                return_url : `${window.location.origin}/checkout/success`, // Fontion predefinit
            }
        })

        if(error){
            setError(error.message ?? "Paiement refusee")
        }

        setLoading(false)
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <PaymentElement/>
            <button 
            type="submit" 
            disabled={!stripe || loading} 
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"/>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
    )


    
}
export default function CheckoutForm({clientSecret}: {clientSecret : string}){
        return(
            <Elements
            stripe={getStripe()}
            options={{ clientSecret, appearance: { theme : "stripe"}}}>
            
            <PaymentElement />
            </Elements>
        )
}