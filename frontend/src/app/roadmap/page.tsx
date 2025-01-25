import { checkUser } from "@/lib/checkUser"
import { redirect } from "next/navigation"
import RoadmapClient from "./client"
import { BackButton } from "@/components/ui/back-button"

export default async function RoadmapPage() {
  const user = await checkUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="relative">
      <BackButton />
      <RoadmapClient userId={user.clerkUserId} />
    </div>
  )
}