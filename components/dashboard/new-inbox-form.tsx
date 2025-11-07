"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Crown } from "lucide-react"
import { UpgradeDialog } from "./upgrade-dialog"

export function NewInboxForm({ userId, subscriptionTier }: { userId: string; subscriptionTier: string }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const router = useRouter()

  const isUnlimited = subscriptionTier === "unlimited"

  const generateRandomSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    // Auto-generate random slug for unlimited users if they haven't customized it
    if (isUnlimited && !slug) {
      setSlug(generateRandomSlug())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
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
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Inbox details</CardTitle>
          <CardDescription>Configure your file submission form</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Project Submissions, Resume Upload"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Give your Inbox a clear, descriptive name</p>
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
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
    </>
  )
}
