import type React from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Sparkles,
  Download,
  FileText,
  Folder,
  ImageIcon,
  Video,
  Music,
  Code,
  Mail,
  Send,
  Inbox,
} from "lucide-react"
import { SubmissionForm } from "@/components/submit/submission-form"
import Link from "next/link"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  upload: Upload,
  download: Download,
  "file-text": FileText,
  folder: Folder,
  image: ImageIcon,
  video: Video,
  music: Music,
  code: Code,
  mail: Mail,
  send: Send,
  inbox: Inbox,
}

export default async function SubmitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: inbox } = await supabase.from("inboxes").select("*").eq("slug", slug).single()

  if (!inbox) {
    notFound()
  }

  if (!inbox.is_active) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/30">
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Submitly</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="border-border/50 max-w-md shadow-lg">
            <CardHeader className="text-center space-y-3">
              <CardTitle className="text-2xl">Inbox not found</CardTitle>
              <CardDescription>
                This inbox doesn't exist or has been deleted. Please check the link and try again.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (inbox.is_paused) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/30">
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Submitly</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <Card className="border-border/50 shadow-lg bg-muted/30 border-yellow-600/20">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-600/10 ring-2 ring-yellow-600/30">
                  <div className="h-2 w-2 rounded-full bg-yellow-600 animate-pulse"></div>
                </div>
                <CardTitle className="text-2xl">Submissions paused</CardTitle>
                <CardDescription className="text-base">
                  This inbox is temporarily not accepting new submissions. Please check back later or contact the
                  creator.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Back to home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const IconComponent = ICON_MAP[inbox.icon || "sparkles"] || Sparkles

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 shadow-sm">
              <Upload className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Submitly</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl fade-in">
          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center space-y-3 pb-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                <IconComponent className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {inbox.title}
              </CardTitle>
              {inbox.description && (
                <CardDescription className="text-base leading-relaxed">{inbox.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              <SubmissionForm inboxId={inbox.id} user={user} allowMultipleFiles={inbox.allow_multiple_files} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
