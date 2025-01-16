import { Content } from "@/types/content"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ContentDisplayProps {
  content: Content
  onTextSelect: (text: string) => void
  selectedText: string
}

export default function ContentDisplay({ content, onTextSelect, selectedText }: ContentDisplayProps) {
  const renderText = (text: string) => {
    if (!selectedText) return text;
    const parts = text.split(selectedText)
    return parts.map((part, i) => (
      <>
        {part}
        {i < parts.length - 1 && (
          <span className="bg-yellow-500/20 px-1 rounded">
            {selectedText}
          </span>
        )}
      </>
    ))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8" onMouseUp={() => {
          const selection = window.getSelection();
          if (selection) onTextSelect(selection.toString());
        }}>
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">1</span>
              Theory
            </h3>
            <div className="prose dark:prose-invert max-w-none pl-8">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                }}
              >
                {content.contentTheory}
              </ReactMarkdown>
            </div>
          </section>

          <Separator />
          
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">2</span>
              Code Examples
            </h3>
            <div className="pl-8">
              <SyntaxHighlighter 
                language="python"
                style={oneDark}
                className="rounded-lg !bg-zinc-900 !p-4"
              >
                {content.contentCodes}
              </SyntaxHighlighter>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">3</span>
              Syntax
            </h3>
            <div className="prose dark:prose-invert max-w-none pl-8">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                  pre: ({ children }) => (
                    <pre className="bg-muted rounded-lg p-4 my-4 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded">{children}</code>,
                }}
              >
                {content.contentSyntax}
              </ReactMarkdown>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}