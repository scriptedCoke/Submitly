"use client"

import { Button } from "@/components/ui/button"
import { createPortalSession } from "@/app/actions/stripe"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManage = async () => {
    setIsLoading(true)
    try {
      await createPortalSession()
    } catch (error) {
      console.error("Error creating portal session:", error)
      alert("Failed to open billing portal. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={handleManage} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Loading...
        </>
      ) : (
        "Manage subscription"
      )}
    </Button>
  )
}
