"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Check } from "lucide-react"
import { UpgradeButton } from "./upgrade-button"

export function UpgradeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade to Unlimited
          </DialogTitle>
          <DialogDescription>Remove all limits and unlock premium features for just $2/month.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">$2</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Unlimited Inboxes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Unlimited submissions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Unlimited storage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Pause/unpause submissions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Custom URL slugs</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end">
          <UpgradeButton className="w-full sm:w-auto" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
