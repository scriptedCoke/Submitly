"use server"

import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function deleteInboxWithFiles(inboxId: string) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    // Fetch all submissions for this inbox
    const { data: submissions, error: fetchError } = await supabase
      .from("submissions")
      .select("file_url")
      .eq("inbox_id", inboxId)

    if (fetchError) throw fetchError

    // Delete all files from Vercel Blob
    if (submissions && submissions.length > 0) {
      const deletePromises = submissions.map((submission) => del(submission.file_url))
      await Promise.all(deletePromises)
    }

    // Delete all submissions (database records)
    const { error: deleteSubmissionsError } = await supabase.from("submissions").delete().eq("inbox_id", inboxId)

    if (deleteSubmissionsError) throw deleteSubmissionsError

    // Delete the inbox
    const { error: deleteInboxError } = await supabase
      .from("inboxes")
      .delete()
      .eq("id", inboxId)
      .eq("creator_id", user.id)

    if (deleteInboxError) throw deleteInboxError

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting inbox with files:", error)
    return { error: error instanceof Error ? error.message : "Failed to delete inbox" }
  }
}
