"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type SubmitBox = {
  id: string
  title: string
  description: string | null
  slug: string
  is_active: boolean
  created_at: string
  submissions: { count: number }[]
}

export function SubmitBoxList({ submitboxes }: { submitboxes: SubmitBox[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SubmitBox? All submissions will be permanently deleted.")) {
      return
    }

    setDeletingId(id)
    const supabase = createClient()

    const { error } = await supabase.from("submitboxes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting submitbox:", error)
      alert("Failed to delete SubmitBox")
    } else {
      router.refresh()
    }

    setDeletingId(null)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submitboxes.map((box) => {
        const submissionCount = box.submissions?.[0]?.count || 0

        return (
          <Card key={box.id} className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-lg line-clamp-1">{box.title}</CardTitle>
                {box.description && (
                  <CardDescription className="line-clamp-2 text-sm">{box.description}</CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDelete(box.id)}
                    disabled={deletingId === box.id}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === box.id ? "Deleting..." : "Delete"}
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
                {box.is_active ? (
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
                  <Link href={`/dashboard/submitbox/${box.id}`}>View submissions</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/submit/${box.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
