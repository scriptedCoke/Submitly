"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Download, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { SubmissionsList } from "@/components/dashboard/submissions-list"
import { PauseInboxButton } from "@/components/dashboard/pause-inbox-button"
import { EditInboxDialog } from "@/components/dashboard/edit-inbox-dialog"
import { DeleteInboxButton } from "@/components/dashboard/delete-inbox-button"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  email?: string
}

type Inbox = {
  id: string
  title: string
  description: string | null
  slug: string
  is_active: boolean
  is_paused: boolean
  created_at: string
}

type Submission = {
  id: string
  submitter_name: string
  submitter_user_id: string | null
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  created_at: string
}

async function fetchSubmissions(inboxId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("inbox_id", inboxId)
    .order("created_at", { ascending: false })

  return data || []
}

export function InboxDetailClient({
  user,
  inbox,
  subscriptionTier,
}: {
  user: User
  inbox: Inbox
  subscriptionTier: string
}) {
  const { data: submissions, mutate } = useSWR<Submission[]>(`submissions-${inbox.id}`, () =>
    fetchSubmissions(inbox.id),
  )

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/submit/${inbox.slug}`
  const isUnlimited = subscriptionTier === "unlimited"

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-6xl py-8 px-4 animate-fade-in">
          <Button variant="ghost" asChild className="mb-6 transition-all hover:translate-x-1 duration-200">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>

          <Card className="border-border/50 mb-8 transition-all hover:shadow-lg duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{inbox.title}</CardTitle>
                  </div>
                  {inbox.description && <CardDescription className="text-base">{inbox.description}</CardDescription>}
                </div>
                <div className="flex gap-2">
                  <EditInboxDialog inbox={inbox} subscriptionTier={subscriptionTier} />
                  <DeleteInboxButton inboxId={inbox.id} />
                  <PauseInboxButton inboxId={inbox.id} isPaused={inbox.is_paused} isUnlimited={isUnlimited} />
                  {inbox.is_active ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{submissions?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Submissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(inbox.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Public submission link
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="transition-all hover:scale-105 duration-200 hover:bg-primary/10 bg-transparent"
                  >
                    <Link href={`/submit/${inbox.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Submissions</h2>
              <p className="text-sm text-muted-foreground">Files submitted to this Inbox</p>
            </div>
          </div>

          {submissions && submissions.length > 0 ? (
            <SubmissionsList submissions={submissions} inboxId={inbox.id} onUpdate={mutate} />
          ) : (
            <Card className="border-border/50 border-dashed transition-all hover:border-primary/50 duration-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Download className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Share your Inbox link to start receiving file submissions.
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/submit/${inbox.slug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview submission form
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
