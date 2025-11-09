"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Crown, Plus } from "lucide-react"
import { UpgradeDialog } from "./upgrade-dialog"
import { IconPicker } from "./icon-picker"

export function NewInboxDialog({
  userId,
  subscriptionTier,
  onSuccess,
}: { userId: string; subscriptionTier: string; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [icon, setIcon] = useState("sparkles")
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [inboxCount, setInboxCount] = useState(0)
  const router = useRouter()

  const isUnlimited = subscriptionTier === "unlimited"
  const inboxLimit = isUnlimited ? null : 10
  const hasReachedLimit = inboxLimit && inboxCount >= inboxLimit

  const TITLE_MAX_LENGTH = 60

  const generateRandomSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  useEffect(() => {
    const fetchInboxCount = async () => {
      const supabase = createClient()
      const { count, error } = await supabase.from("inboxes").select("*", { count: "exact" }).eq("creator_id", userId)

      if (!error) {
        setInboxCount(count || 0)
      }
    }

    if (open) {
      fetchInboxCount()
    }
  }, [open, userId])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (isUnlimited && !slug) {
      setSlug(generateRandomSlug())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (hasReachedLimit) {
      setShowUpgradeDialog(true)
      setIsLoading(false)
      return
    }

    if (!title.trim()) {
      setError("Title is required")
      setIsLoading(false)
      return
    }

    if (title.length > TITLE_MAX_LENGTH) {
      setError(`Title must be ${TITLE_MAX_LENGTH} characters or less`)
      setIsLoading(false)
      return
    }

    const finalSlug = isUnlimited ? slug.trim() : generateRandomSlug()

    if (!finalSlug) {
      setError("Slug is required")
      setIsLoading(false)
      return
    }

    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data, error: insertError } = await supabase
        .from("inboxes")
        .insert({
          creator_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          slug: finalSlug,
          icon: icon,
          is_active: true,
          is_paused: false,
          allow_multiple_files: allowMultipleFiles,
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("This slug is already taken. Please choose a different one.")
        }
        throw insertError
      }

      setTitle("")
      setDescription("")
      setSlug("")
      setIcon("sparkles")
      setAllowMultipleFiles(false)
      setOpen(false)

      onSuccess?.()

      router.push(`/dashboard/inbox/${data.id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create Inbox")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative group">
            <Button disabled={hasReachedLimit} className="transition-all hover:scale-105 duration-200 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              New Inbox
            </Button>
            {hasReachedLimit && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-muted text-sm text-muted-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md border border-border/50">
                You've reached max inboxes. Upgrade to create more.
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create new Inbox</DialogTitle>
            <DialogDescription>Configure your file submission form</DialogDescription>
          </DialogHeader>

          {hasReachedLimit && (
            <div className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 border border-amber-500/20">
              You've reached the maximum of {inboxLimit} inboxes on the Basic plan. Upgrade to Unlimited for unlimited
              inboxes.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Project Submissions, Resume Upload"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional: Add instructions or context for submitters"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <IconPicker value={icon} onChange={setIcon} subscriptionTier={subscriptionTier} />

            <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="multiple-files" className="text-base font-medium">
                  Allow multiple files
                </Label>
                <p className="text-sm text-muted-foreground">Let submitters upload multiple files in one submission</p>
              </div>
              <Switch id="multiple-files" checked={allowMultipleFiles} onCheckedChange={setAllowMultipleFiles} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL Slug *</Label>
                {!isUnlimited && (
                  <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setShowUpgradeDialog(true)}>
                    <Crown className="h-3 w-3" />
                    Unlimited
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/submit/</span>
                <Input
                  id="slug"
                  placeholder={isUnlimited ? "my-inbox" : "auto-generated"}
                  value={slug}
                  onChange={(e) => isUnlimited && setSlug(e.target.value.toLowerCase())}
                  required={isUnlimited}
                  disabled={!isUnlimited}
                  className="h-10 flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isUnlimited
                  ? "This will be part of your public submission link. Only lowercase letters, numbers, and hyphens."
                  : "Custom URL slugs are available with Unlimited plan. A random slug will be auto-generated."}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Inbox"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
    </>
  )
}
