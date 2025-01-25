import { Content } from "@/types/content";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';

interface ContentListProps {
  contents: Content[];
  onContentClick: Dispatch<SetStateAction<Content | null>>;
  selectedContent: Content | null;
}

export default function ContentList({ contents, onContentClick, selectedContent }: ContentListProps) {
  return (
    <Card className="w-80 h-full border-l rounded-none">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Your Learning Contents</CardTitle>
      </CardHeader>
      <div className="overflow-auto">
        {contents.map((content) => (
          <button
            key={content.id}
            onClick={() => onContentClick(content)}
            className={`w-full text-left px-4 py-3 hover:bg-accent/50 flex items-center justify-between transition-colors ${
              selectedContent?.id === content.id 
                ? "bg-accent text-accent-foreground" 
                : ""
            }`}
          >
            <span className="text-sm font-medium truncate pr-2">
              {content.title}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}