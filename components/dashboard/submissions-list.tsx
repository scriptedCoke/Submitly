"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, User, Eye } from "lucide-react"
import { useState } from "react"
import { deleteSubmission } from "@/app/actions/submissions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export function SubmissionsList({
  submissions,
  inboxId,
  onUpdate,
}: {
  submissions: Submission[]
  inboxId: string
  onUpdate?: () => void
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null)

  const handleDelete = async (submission: Submission) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return
    }

    setDeletingId(submission.id)

    try {
      const result = await deleteSubmission(submission.id, submission.file_url, inboxId)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete submission")
      }

      onUpdate?.()
    } catch (error) {
      console.error("Error deleting submission:", error)
      alert(error instanceof Error ? error.message : "Failed to delete submission")
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canPreview = (fileType: string) => {
    return (
      fileType.startsWith("image/") ||
      fileType === "application/pdf" ||
      fileType.startsWith("video/") ||
      fileType.startsWith("audio/")
    )
  }

  const handlePreview = (submission: Submission) => {
    setPreviewFile({
      url: submission.file_url,
      name: submission.file_name,
      type: submission.file_type,
    })
  }

  return (
    <>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <Card key={submission.id} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{submission.file_name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{submission.submitter_name}</span>
                  <span>•</span>
                  <span>{formatFileSize(submission.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(submission.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canPreview(submission.file_type) && (
                  <Button variant="outline" size="sm" onClick={() => handlePreview(submission)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href={submission.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(submission)}
                  disabled={deletingId === submission.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
            {previewFile?.type.startsWith("image/") && (
              <img
                src={previewFile.url || "/placeholder.svg"}
                alt={previewFile.name}
                className="max-w-full h-auto rounded-lg"
              />
            )}
            {previewFile?.type === "application/pdf" && (
              <iframe src={previewFile.url} className="w-full h-[70vh] rounded-lg" title={previewFile.name} />
            )}
            {previewFile?.type.startsWith("video/") && (
              <video src={previewFile.url} controls className="max-w-full h-auto rounded-lg">
                Your browser does not support the video tag.
              </video>
            )}
            {previewFile?.type.startsWith("audio/") && (
              <audio src={previewFile.url} controls className="w-full">
                Your browser does not support the audio tag.
              </audio>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
