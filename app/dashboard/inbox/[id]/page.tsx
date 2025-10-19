import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InboxDetailClient } from "@/components/dashboard/inbox-detail-client"

export default async function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single()

  const { data: inbox } = await supabase.from("inboxes").select("*").eq("id", id).eq("creator_id", user.id).single()

  if (!inbox) {
    redirect("/dashboard")
  }

  return <InboxDetailClient user={user} inbox={inbox} subscriptionTier={profile?.subscription_tier || "basic"} />
}
