import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { MessageSquare } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface QuestionFormProps {
  userId: string
  contentId?: string
  selectedText: string
}

export default function QuestionForm({ userId, contentId, selectedText }: QuestionFormProps) {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentId || !selectedText) {
      toast.error("Please select content and text first")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/mentor/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: selectedText,
          question,
          userId,
          contentId
        }),
      })
      const data = await res.json()
      setResponse(data.response)
      setQuestion("")
    } catch (error) {
      toast.error("Failed to get response")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about the selected text..."
              className="min-h-[100px] resize-none"
              disabled={!selectedText}
            />
            <Button 
              type="submit" 
              disabled={loading || !selectedText}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask Question
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                  pre: ({ children }) => (
                    <pre className="bg-muted rounded-lg p-4 my-4 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}