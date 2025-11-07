"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UpgradeDialog } from "./upgrade-dialog"

export function UpgradeDialogWrapper() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setOpen(true)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      router.push("/dashboard")
    }
  }

  return <UpgradeDialog open={open} onOpenChange={handleOpenChange} />
}
