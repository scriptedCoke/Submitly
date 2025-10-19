"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Pencil } from "lucide-react"
import { IconPicker } from "./icon-picker"

type Inbox = {
  id: string
  title: string
  description: string | null
  slug: string
  icon?: string
  allow_multiple_files: boolean
}

interface EditInboxDialogProps {
  inbox: Inbox
  subscriptionTier: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditInboxDialog({
  inbox,
  subscriptionTier,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: EditInboxDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState(inbox.title)
  const [description, setDescription] = useState(inbox.description || "")
  const [icon, setIcon] = useState(inbox.icon || "sparkles")
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(inbox.allow_multiple_files)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("inboxes")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          icon: icon,
          allow_multiple_files: allowMultipleFiles,
        })
        .eq("id", inbox.id)

      if (updateError) {
        throw updateError
      }

      router.refresh()
      setIsOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update Inbox")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inbox</DialogTitle>
          <DialogDescription>Update your Inbox settings</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Project Submissions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional: Add instructions or context"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <IconPicker value={icon} onChange={setIcon} subscriptionTier={subscriptionTier} />

          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="edit-multiple-files" className="text-sm font-medium">
                Allow multiple files
              </Label>
              <p className="text-xs text-muted-foreground">Let submitters upload multiple files</p>
            </div>
            <Switch id="edit-multiple-files" checked={allowMultipleFiles} onCheckedChange={setAllowMultipleFiles} />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
