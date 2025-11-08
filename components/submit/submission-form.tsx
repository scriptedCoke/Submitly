"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle2, Loader2, X, Plus, LogIn, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

export function SubmissionForm({
  inboxId,
  user,
  allowMultipleFiles,
}: { inboxId: string; user: User | null; allowMultipleFiles: boolean }) {
  const [name, setName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const fetchUserName = async () => {
      if (user && user.id) {
        try {
          const supabase = createClient()
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error("[v0] Error fetching profile:", profileError)
          } else if (data?.full_name) {
            setName(data.full_name)
          }
        } catch (err) {
          console.error("[v0] Error creating Supabase client:", err)
        }
      }
    }
    fetchUserName()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    for (const file of selectedFiles) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("Each file must be less than 50MB")
        return
      }
    }

    if (allowMultipleFiles) {
      setFiles((prev) => [...prev, ...selectedFiles])
    } else {
      setFiles(selectedFiles.slice(0, 1))
    }
    setError(null)
    // Reset the input
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting submission process")
    console.log("[v0] Inbox ID:", inboxId)
    console.log("[v0] User:", user?.id || "anonymous")
    console.log("[v0] Name:", name)
    console.log("[v0] Files count:", files.length)

    if (!name.trim()) {
      setError("Please enter your name")
      setIsLoading(false)
      return
    }

    if (files.length === 0) {
      setError("Please select at least one file")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      console.log("[v0] Supabase client created")

      // Upload all files and create submissions
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`[v0] Processing file ${i + 1}/${files.length}:`, file.name)

        // Upload file to Vercel Blob
        console.log("[v0] Uploading to Vercel Blob...")
        const formData = new FormData()
        formData.append("file", file)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] Upload response status:", uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("[v0] Upload failed:", errorText)
          throw new Error(`Failed to upload ${file.name}: ${errorText}`)
        }

        const uploadData = await uploadResponse.json()
        console.log("[v0] Upload successful, URL:", uploadData.url)

        // Insert submission record
        console.log("[v0] Inserting submission record...")
        const submissionData = {
          inbox_id: inboxId,
          submitter_user_id: user?.id || null,
          submitter_name: name.trim(),
          file_url: uploadData.url,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        }
        console.log("[v0] Submission data:", submissionData)

        const { data: insertedData, error: insertError } = await supabase
          .from("submissions")
          .insert(submissionData)
          .select()

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw new Error(`Database error: ${insertError.message}`)
        }

        console.log("[v0] Submission inserted successfully:", insertedData)
      }

      console.log("[v0] All files submitted successfully")
      setIsSuccess(true)
      setFiles([])
      if (!user) {
        setName("")
      }
    } catch (err: unknown) {
      console.error("[v0] Submission error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to submit files"
      console.error("[v0] Error message:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Submission received!</h3>
        <p className="text-muted-foreground mb-6">Thank you for your submission. The creator has been notified.</p>
        <div className="flex gap-3">
          {user ? (
            <Button asChild className="shadow-sm">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild className="shadow-sm">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign into Submitly
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false)
              setFiles([])
            }}
            className="shadow-sm"
          >
            Submit another file
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Your name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={false}
          className="h-11 shadow-sm"
        />
        {user ? (
          <p className="text-xs text-muted-foreground">Signed in as {name || user.email}</p>
        ) : (
          name && <p className="text-xs text-muted-foreground">Submitting as {name}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="file">{allowMultipleFiles ? "Files *" : "File *"}</Label>

        {/* File input */}
        <div className="relative">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            multiple={allowMultipleFiles}
            className="h-11 cursor-pointer shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {/* Selected files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm border border-border/50 shadow-sm hover:bg-muted/70 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add another file button for multiple files */}
        {allowMultipleFiles && files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file")?.click()}
            className="w-full shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another file
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Maximum file size: 50MB per file. All file types accepted.
          {allowMultipleFiles && " You can upload multiple files."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 shadow-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full h-11 shadow-md hover:shadow-lg transition-shadow">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading {files.length} {files.length === 1 ? "file" : "files"}...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Submit {files.length > 0 && `(${files.length})`}
          </>
        )}
      </Button>
    </form>
  )
}
