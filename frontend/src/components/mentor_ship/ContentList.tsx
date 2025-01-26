import { Content } from "@/types/content";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';

interface ContentListProps {
    contents: Content[];
    onSelect: (content: Content) => void;
    selectedId?: string;
  }
  
  export default function ContentList({ contents, onSelect, selectedId }: ContentListProps) {
    return (
      <Card className="max-h-[300px] overflow-auto">
        <CardHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-4">
          <CardTitle>Learning Contents</CardTitle>
        </CardHeader>
        <div className="px-2 pb-2">
          {contents.map((content) => (
            <button
              key={content.id}
              onClick={() => onSelect(content)}
              className={`w-full text-left p-3 rounded-md mb-1 hover:bg-accent/50 transition-colors ${
                selectedId === content.id ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <h3 className="font-medium text-sm line-clamp-2">{content.title}</h3>
            </button>
          ))}
        </div>
      </Card>
    )
  }