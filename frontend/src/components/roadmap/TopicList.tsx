import { Topic } from "@/types/topic";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import { CardHeader } from "../ui/card";
import { CardTitle } from "../ui/card";

interface TopicsListProps {
    topics: Topic[];
    onTopicClick: (topic: Topic) => void;
    selectedTopic: Topic | null | undefined;
  }
  
  export default function TopicsList({ topics, onTopicClick, selectedTopic }: TopicsListProps) {
    return (
      <Card className="w-80 h-full border-l rounded-none">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-lg">Your Learning Paths</CardTitle>
        </CardHeader>
        <div className="overflow-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic)}
              className={`w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between transition-colors ${
                selectedTopic?.id === topic.id 
                  ? "bg-accent text-accent-foreground" 
                  : ""
              }`}
            >
              <span className="text-sm font-medium truncate pr-2">
                {topic.promptName}
              </span>
              {selectedTopic?.id === topic.id ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Card>
    );
  }