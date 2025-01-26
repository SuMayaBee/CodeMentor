import { checkUser } from "@/lib/checkUser"
import { redirect } from "next/navigation"
import ContentClient from "./client"
import { BackButton } from "@/components/ui/back-button"

export default async function ContentPage() {
  const user = await checkUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="relative">
      <BackButton />
      <ContentClient userId={user.clerkUserId} />
    </div>
  )
}