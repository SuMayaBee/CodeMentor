"use client"


import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import RoadmapPath from "@/components/roadmap/RoadmapPath"
import TopicsList from "@/components/roadmap/TopicList"
import { Topic } from "@/types/topic"
import { ArrowRight } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface RoadmapClientProps {
  userId: string;
}

export default function RoadmapClient({ userId }: RoadmapClientProps) {
  const [prompt, setPrompt] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  useEffect(() => {
    fetchTopics()
  }, [userId])

  const fetchTopics = async () => {
    try {
      const response = await fetch(`http://localhost:8000/topics/user/${userId}`)
      const data = await response.json()
      setTopics(data)
    } catch (error) {
      toast.error("Failed to fetch topics")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/topics/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptName: prompt,
          public: isPublic,
          userId: userId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create topic")
      
      const data = await response.json()
      setTopics(prev => [...prev, data])
      setSelectedTopic(data)
      toast.success("Roadmap generated successfully!")
      setPrompt("")
    } catch (error) {
      toast.error("Failed to create roadmap")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background/95">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Your Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-lg">
                    What do you want to learn?
                  </Label>
                  <Input
                    id="prompt"
                    placeholder="e.g., Advanced Python Programming"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Make this roadmap public</Label>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Generate Roadmap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Spinner />
                <p className="text-muted-foreground">Generating your roadmap...</p>
              </div>
            </div>
          ) : (
            selectedTopic && (
              <div className="animate-fadeIn">
                <RoadmapPath 
                  title={selectedTopic.promptName}
                  topics={selectedTopic.topicList.split('\n')}
                />
              </div>
            )
          )}
        </div>
      </div>
      <TopicsList 
        topics={topics}
        onTopicClick={setSelectedTopic}
        selectedTopic={selectedTopic}
      />
    </div>
  )
}