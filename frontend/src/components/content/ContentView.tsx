import { Content } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ContentViewProps {
  content: Content;
}

export default function ContentView({ content }: ContentViewProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="theory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="theory">Theory</TabsTrigger>
            <TabsTrigger value="code">Code Examples</TabsTrigger>
            <TabsTrigger value="syntax">Syntax</TabsTrigger>
          </TabsList>
          <TabsContent value="theory" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content.contentTheory}</ReactMarkdown>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <SyntaxHighlighter 
              language="python" 
              style={oneDark}
              className="rounded-lg !bg-muted"
            >
              {content.contentCodes}
            </SyntaxHighlighter>
          </TabsContent>
          <TabsContent value="syntax">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content.contentSyntax}</ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}