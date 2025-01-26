import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function BackButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-4 left-4"
      asChild
    >
      <Link href="/dashboard" className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  )
}