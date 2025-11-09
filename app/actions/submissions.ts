"use server"

import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function deleteSubmission(submissionId: string, fileUrl: string, inboxId: string) {
  const supabase = await createClient()

  try {
    await del(fileUrl)

    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("file_size")
      .eq("id", submissionId)
      .single()

    if (fetchError) {
      console.error("[v0] Error fetching submission:", fetchError)
      throw new Error(`Database error: ${fetchError.message}`)
    }

    const { error: deleteError } = await supabase.from("submissions").delete().eq("id", submissionId)

    if (deleteError) {
      console.error("[v0] Database deletion error:", deleteError)
      throw new Error(`Database error: ${deleteError.message}`)
    }

    if (submission?.file_size) {
      const { error: updateError } = await supabase.rpc("update_storage_after_delete", {
        file_size_bytes: submission.file_size,
      })

      if (updateError) {
        console.error("[v0] Error updating storage:", updateError)
        // Don't throw here - deletion was successful, storage update is secondary
      }
    }

    revalidatePath(`/dashboard/inbox/${inboxId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting submission:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete submission",
    }
  }
}
