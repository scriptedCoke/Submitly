"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, MoreVertical, Trash2, Pause, Crown, Edit } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UpgradeDialog } from "./upgrade-dialog"
import { EditInboxDialog } from "./edit-inbox-dialog"
import { deleteInboxWithFiles } from "@/app/actions/inbox"

type Inbox = {
  id: string
  title: string
  description: string | null
  slug: string
  is_active: boolean
  is_paused: boolean
  created_at: string
  submissions: { count: number }[]
}

export function InboxList({
  inboxes,
  subscriptionTier,
  onUpdate,
}: {
  inboxes: Inbox[]
  subscriptionTier: string
  onUpdate?: () => void
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [editingInbox, setEditingInbox] = useState<Inbox | null>(null)
  const router = useRouter()

  const isUnlimited = subscriptionTier === "unlimited"

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Inbox? All submissions will be permanently deleted.")) {
      return
    }

    setDeletingId(id)

    try {
      const result = await deleteInboxWithFiles(id)

      if (result.error) {
        throw new Error(result.error)
      }

      // Trigger SWR refetch to update statistics
      onUpdate?.()
    } catch (error) {
      console.error("Error deleting inbox:", error)
      alert("Failed to delete Inbox. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePause = async (id: string, currentPauseState: boolean) => {
    if (!isUnlimited) {
      setShowUpgradeDialog(true)
      return
    }

    setTogglingId(id)
    const supabase = createClient()

    const { error } = await supabase.from("inboxes").update({ is_paused: !currentPauseState }).eq("id", id)

    if (error) {
      console.error("Error toggling pause:", error)
      alert("Failed to update Inbox")
    } else {
      onUpdate?.()
    }

    setTogglingId(null)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inboxes.map((inbox) => {
          const submissionCount = inbox.submissions?.[0]?.count || 0

          return (
            <Card
              key={inbox.id}
              className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{inbox.title}</CardTitle>
                  {inbox.description && (
                    <CardDescription className="line-clamp-2 text-sm">{inbox.description}</CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingInbox(inbox)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTogglePause(inbox.id, inbox.is_paused)}
                      disabled={togglingId === inbox.id}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      {inbox.is_paused ? "Unpause" : "Pause"} submissions
                      {!isUnlimited && (
                        <Badge variant="outline" className="ml-auto gap-1">
                          <Crown className="h-3 w-3" />
                          Unlimited
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(inbox.id)}
                      disabled={deletingId === inbox.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === inbox.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {submissionCount} submission{submissionCount !== 1 ? "s" : ""}
                  </span>
                  {inbox.is_paused ? (
                    <Badge variant="outline" className="ml-auto">
                      Paused
                    </Badge>
                  ) : inbox.is_active ? (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                    <Link href={`/dashboard/inbox/${inbox.id}`}>View submissions</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/submit/${inbox.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
      {editingInbox && (
        <EditInboxDialog
          inbox={editingInbox}
          subscriptionTier={subscriptionTier}
          open={!!editingInbox}
          onOpenChange={(open) => {
            if (!open) {
              setEditingInbox(null)
            }
          }}
          onSuccess={() => {
            onUpdate?.()
          }}
        />
      )}
    </>
  )
}
