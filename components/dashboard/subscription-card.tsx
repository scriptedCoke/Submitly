"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ManageSubscriptionButton } from "./manage-subscription-button"
import { UpgradeButton } from "./upgrade-button"
import { Crown, Package } from "lucide-react"

interface Profile {
  subscription_tier: string
  stripe_subscription_id: string | null
  total_storage_bytes: number
}

export function SubscriptionCard({ profile }: { profile: Profile }) {
  const isUnlimited = profile.subscription_tier === "unlimited"
  const storageUsedMB = (profile.total_storage_bytes / (1024 * 1024)).toFixed(2)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isUnlimited ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold capitalize">{profile.subscription_tier} Plan</p>
                {isUnlimited && <Badge variant="default">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{isUnlimited ? "$2/month" : "Free forever"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-3">Plan Features</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {isUnlimited ? (
              <>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited Inboxes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited submissions
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited storage
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Pause/unpause Inboxes
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Up to 10 Inboxes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  200 MB total storage
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {storageUsedMB} MB used
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="pt-2">
          {isUnlimited && profile.stripe_subscription_id ? <ManageSubscriptionButton /> : <UpgradeButton />}
        </div>
      </CardContent>
    </Card>
  )
}
