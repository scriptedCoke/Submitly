import "server-only"

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Subscription price IDs - replace with your actual Stripe price IDs
export const UNLIMITED_PRICE_ID = process.env.STRIPE_UNLIMITED_PRICE_ID || "price_unlimited"
