"use server"

import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function deleteSubmission(submissionId: string, fileUrl: string, inboxId: string) {
  const supabase = await createClient()

  try {
    await del(fileUrl)

    const { error } = await supabase.from("submissions").delete().eq("id", submissionId)

    if (error) {
      console.error("[v0] Database deletion error:", error)
      throw new Error(`Database error: ${error.message}`)
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
