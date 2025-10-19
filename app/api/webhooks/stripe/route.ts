import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

// Create Supabase admin client for webhook
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const customerId = session.customer as string

        console.log("[v0] Checkout completed for user:", userId, "customer:", customerId)

        if (userId && session.subscription) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "unlimited",
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: customerId,
            })
            .eq("id", userId)

          if (error) {
            console.error("[v0] Failed to update profile:", error)
          } else {
            console.log("[v0] Successfully upgraded user to unlimited")
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log("[v0] Subscription updated for customer:", customerId)

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          const isActive = subscription.status === "active"
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: isActive ? "unlimited" : "basic",
            })
            .eq("id", profile.id)

          if (error) {
            console.error("[v0] Failed to update subscription:", error)
          } else {
            console.log("[v0] Updated subscription status to:", isActive ? "unlimited" : "basic")
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log("[v0] Subscription deleted for customer:", customerId)

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "basic",
              stripe_subscription_id: null,
            })
            .eq("id", profile.id)

          if (error) {
            console.error("[v0] Failed to downgrade user:", error)
          } else {
            console.log("[v0] Successfully downgraded user to basic")
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
