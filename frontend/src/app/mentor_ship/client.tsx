"use client"

import { useState, useEffect } from "react"
import ContentList from "@/components/mentor_ship/ContentList"
import ContentDisplay from "@/components/mentor_ship/ContentDisplay"
import QuestionForm from "@/components/mentor_ship/QuestionForm"
import { Content } from "@/types/content"
import { toast } from "sonner"

export default function MentorshipClient({ userId }: { userId: string }) {
  const [contents, setContents] = useState<Content[]>([])
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [selectedText, setSelectedText] = useState("")

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/content/user/${userId}`)
      const data = await response.json()
      setContents(data)
    } catch (error) {
      toast.error("Failed to fetch contents")
    }
  }

  return (
    <div className="grid grid-cols-[300px,1fr,350px] h-[calc(100vh-4rem)] pt-16">
      <div className="border-r overflow-auto">
        <ContentList 
          contents={contents}
          onSelect={setSelectedContent}
          selectedId={selectedContent?.id}
        />
      </div>
      <div className="overflow-auto p-6">
        {selectedContent ? (
          <ContentDisplay 
            content={selectedContent}
            onTextSelect={setSelectedText}
            selectedText={selectedText}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a content to view details
          </div>
        )}
      </div>
      <div className="border-l p-4">
        <QuestionForm
          userId={userId}
          contentId={selectedContent?.id}
          selectedText={selectedText}
        />
      </div>
    </div>
  )
}