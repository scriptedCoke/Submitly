"use server"

import { stripe, UNLIMITED_PRICE_ID } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCheckoutSession() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

  let customerId = profile?.stripe_customer_id

  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      if (customer.deleted) {
        customerId = null
      }
    } catch (error: any) {
      // Customer doesn't exist, create a new one
      if (error.type === "StripeInvalidRequestError") {
        customerId = null
      } else {
        throw error
      }
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: UNLIMITED_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?canceled=true`,
    metadata: {
      supabase_user_id: user.id,
    },
  })

  if (!session.url) {
    throw new Error("Failed to create checkout session")
  }

  redirect(session.url)
}

export async function createPortalSession() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

  if (!profile?.stripe_customer_id) {
    throw new Error("No Stripe customer found. Please contact support.")
  }

  try {
    let customerId = profile.stripe_customer_id
    let customer

    try {
      customer = await stripe.customers.retrieve(customerId)
    } catch (error: any) {
      if (error.type === "StripeInvalidRequestError") {
        // Customer doesn't exist, create a new one
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        })
        customerId = newCustomer.id
        customer = newCustomer

        // Update the profile with the new customer ID
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
      } else {
        throw error
      }
    }

    if (customer.deleted) {
      throw new Error("Stripe customer has been deleted. Please contact support.")
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/profile`,
    })

    redirect(session.url)
  } catch (error: any) {
    console.error("[v0] Error creating portal session:", error)

    // Provide more specific error messages
    if (error.type === "StripeInvalidRequestError") {
      throw new Error("Unable to access billing portal. Please contact support.")
    }

    throw new Error("Failed to create billing portal session. Please try again.")
  }
}
