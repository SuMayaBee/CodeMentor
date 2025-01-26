import { Topic } from "@/types/topic";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { CardHeader } from "../ui/card";
import { CardTitle } from "../ui/card";



interface RoadmapPathProps {
    topics: string[];
    title: string;
  }
  
  export default function RoadmapPath({ topics, title }: RoadmapPathProps) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="relative flex items-start animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-full items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {index + 1}
                  </div>
                  {index !== topics.length - 1 && (
                    <div className="absolute top-12 left-6 h-full w-0.5 bg-primary/30" />
                  )}
                </div>
                <div className="ml-6 flex-1">
                  <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <p className="text-base">{topic.trim()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }