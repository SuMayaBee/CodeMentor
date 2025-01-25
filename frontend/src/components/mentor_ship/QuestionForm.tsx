import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Info, MessageSquare } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface QuestionFormProps {
  userId: string
  contentId?: string
  selectedText: string
}

export default function QuestionForm({ 
  userId, 
  contentId = '4a3b165c-fae2-4965-bfcc-7cf1af28d4d1', 
  selectedText 
}: QuestionFormProps) {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [isTextSelected, setIsTextSelected] = useState(false)

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
          <CardTitle>Ask AI Mentor</CardTitle>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Info className="h-5 w-5" />
              <p className="text-sm font-medium">How to ask questions:</p>
            </div>
            <ol className="text-sm text-muted-foreground mt-2 ml-6 list-decimal">
              <li>Select any text from the content</li>
              <li>Type your question about the selected text</li>
              <li>Click "Ask Question" to get AI assistance</li>
            </ol>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={selectedText ? "What would you like to ask about the selected text?" : "Please select text first..."}
              className="min-h-[100px] resize-none"
              disabled={!selectedText || loading}
            />
            
            {selectedText && (
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-sm font-medium">Selected Context:</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Processing...
                    </span>
                  ) : (
                    selectedText
                  )}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !selectedText || !question}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Generating Response...
                </span>
              ) : (
                "Ask Question"
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