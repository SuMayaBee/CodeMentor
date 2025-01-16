import { checkUser } from "@/lib/checkUser"
import { redirect } from "next/navigation"
import MentorshipClient from "./client"
import { BackButton } from "@/components/ui/back-button"

export default async function MentorshipPage() {
  const user = await checkUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="relative">
      <BackButton />
      <MentorshipClient userId={user.clerkUserId} />
    </div>
  )
}