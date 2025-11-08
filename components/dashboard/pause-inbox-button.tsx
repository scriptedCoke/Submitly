"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pause, Play, Loader2, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function PauseInboxButton({
  inboxId,
  isPaused,
  isUnlimited,
  onUpdate,
}: {
  inboxId: string
  isPaused: boolean
  isUnlimited: boolean
  onUpdate?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const router = useRouter()

  const handleTogglePause = async () => {
    // Check if user has unlimited plan
    if (!isUnlimited) {
      setShowUpgradeDialog(true)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("inboxes").update({ is_paused: !isPaused }).eq("id", inboxId)

      if (error) throw error

      onUpdate?.()
      router.refresh()
    } catch (error) {
      console.error("Failed to toggle pause:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleTogglePause} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPaused ? (
          <>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </>
        ) : (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </>
        )}
        {!isUnlimited && (
          <Badge variant="outline" className="ml-2 gap-1">
            <Crown className="h-3 w-3" />
            Unlimited
          </Badge>
        )}
      </Button>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to Unlimited
            </DialogTitle>
            <DialogDescription>
              Pausing submissions is an Unlimited feature. Upgrade now to pause and resume submissions anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">$2</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited Inboxes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited storage
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Pause submissions anytime
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Maybe later
            </Button>
            <Button asChild>
              <Link href="/dashboard/upgrade">Upgrade now</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
