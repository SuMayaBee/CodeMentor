import { Terminal, Maximize2, Minimize2 } from 'lucide-react';

export function OutputTerminal({ output }: { output: string }) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-gray-800 h-full shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#252526]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Output</span>
        </div>
      </div>
      <div className="p-4 font-mono text-sm h-[calc(100%-40px)] overflow-auto">
        {output ? (
          <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
        ) : (
          <span className="text-gray-500">// Output will appear here...</span>
        )}
      </div>
    </div>
  );
}