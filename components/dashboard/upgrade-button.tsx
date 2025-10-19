"use client"

import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/stripe"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      await createCheckoutSession()
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Failed to start checkout. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Upgrade now"
      )}
    </Button>
  )
}
