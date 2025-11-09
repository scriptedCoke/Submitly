"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, HardDrive, Inbox, Crown, TrendingUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ManageSubscriptionButton } from "@/components/dashboard/manage-subscription-button"
import { UpgradeDialogWrapper } from "@/components/dashboard/upgrade-dialog-wrapper"
import { Progress } from "@/components/ui/progress"
import { NewInboxDialog } from "@/components/dashboard/new-inbox-dialog"
import { InboxList } from "@/components/dashboard/inbox-list"
import Link from "next/link"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  email?: string
}

async function fetchDashboardData(userId: string) {
  const supabase = createClient()

  // Fetch profile and inboxes in parallel
  const [profileResult, inboxesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("inboxes")
      .select("*, submissions:submissions(count)")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false }),
  ])

  return {
    profile: profileResult.data,
    inboxes: inboxesResult.data || [],
  }
}

export function DashboardClient({ user, showUpgrade }: { user: User; showUpgrade: boolean }) {
  const { data, mutate, isLoading } = useSWR(`dashboard-${user.id}`, () => fetchDashboardData(user.id), {
    refreshInterval: 0, // Don't auto-refresh, only on mutate
    revalidateOnFocus: true,
  })

  const profile = data?.profile
  const inboxes = data?.inboxes || []

  const totalInboxes = inboxes.length
  const totalSubmissions = profile?.total_submissions || 0
  const storageUsedMB = ((profile?.total_storage_bytes || 0) / (1024 * 1024)).toFixed(1)
  const subscriptionTier = profile?.subscription_tier || "basic"

  // Calculate limits
  const inboxLimit = subscriptionTier === "basic" ? 10 : null
  const storageLimit = subscriptionTier === "basic" ? 200 : null
  const isAtInboxLimit = inboxLimit && totalInboxes >= inboxLimit

  // Calculate percentages for progress bars
  const inboxPercentage = inboxLimit ? (totalInboxes / inboxLimit) * 100 : 0
  const storagePercentage = storageLimit ? (Number.parseFloat(storageUsedMB) / storageLimit) * 100 : 0

  // Check if storage limit reached and pause all inboxes if so
  const isStorageLimitReached = storageLimit && Number.parseFloat(storageUsedMB) >= storageLimit

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={user} />

        <main className="flex-1 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            {/* Loading skeleton for stats cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-border/50 bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-12 bg-muted-foreground/20 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading skeleton for inboxes section */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Your Inboxes</h2>
              </div>
              <div className="h-11 w-40 bg-muted-foreground/20 rounded-md animate-pulse"></div>
            </div>

            <Card className="border-border/50">
              <CardContent className="py-16">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted-foreground/10 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
          {/* Show storage warning if limit reached */}
          {isStorageLimitReached && (
            <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 flex items-center justify-between">
              <div>
                <p className="font-medium">Storage limit reached</p>
                <p className="text-xs mt-1">
                  All inboxes have been paused. Please delete files or upgrade to continue receiving submissions.
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 via-background to-background transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inboxes</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalInboxes}
                  {inboxLimit && <span className="text-sm font-normal text-muted-foreground">/{inboxLimit}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">Active submission forms</p>
                {inboxLimit && <Progress value={inboxPercentage} className="h-1.5" />}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-green-500/10 via-background to-background transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">Total files received</p>
                {totalSubmissions > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 via-background to-background transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <HardDrive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {storageUsedMB}
                  {storageLimit && (
                    <span className="text-sm font-normal text-muted-foreground"> MB/{storageLimit} MB</span>
                  )}
                  {!storageLimit && <span className="text-sm font-normal text-muted-foreground"> MB</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">Space used</p>
                {storageLimit && <Progress value={storagePercentage} className="h-1.5" />}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 via-background to-background transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{subscriptionTier}</div>
                {subscriptionTier === "basic" ? (
                  <Button variant="link" className="h-auto p-0 text-xs text-primary hover:text-primary/80" asChild>
                    <Link href="/dashboard?upgrade=true">Upgrade to Unlimited →</Link>
                  </Button>
                ) : (
                  <ManageSubscriptionButton />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inboxes Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Your Inboxes</h2>
              <p className="text-sm text-muted-foreground">Manage your file submission forms</p>
            </div>
            <NewInboxDialog
              userId={user.id}
              subscriptionTier={subscriptionTier}
              onSuccess={mutate}
              isAtLimit={isAtInboxLimit}
            />
          </div>

          {inboxes.length > 0 ? (
            <InboxList inboxes={inboxes} subscriptionTier={subscriptionTier} onUpdate={mutate} />
          ) : (
            <Card className="border-border/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Inbox className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Inboxes yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Create your first Inbox to start collecting file submissions from others.
                </p>
                <NewInboxDialog
                  userId={user.id}
                  subscriptionTier={subscriptionTier}
                  onSuccess={mutate}
                  isAtLimit={isAtInboxLimit}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {showUpgrade && subscriptionTier === "basic" && <UpgradeDialogWrapper />}
    </div>
  )
}
