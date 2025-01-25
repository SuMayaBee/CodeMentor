'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Components } from 'react-markdown';
import Editor from '@monaco-editor/react';

interface ProblemRequest {
  user_specification: string;
  topic: string;
  difficulty: string;
  language: string;
}

interface ModifyProblemRequest extends ProblemRequest {
  given_problem: string;
  user_wants: 'easier' | 'harder';
}

interface TrackingRequest {
    given_problem: string;
    topic: string;
    language: string;
    user_code: string;
  }

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Add debounce utility before component
const debounce = <T extends (...args: any[]) => void>(
    callback: T,
    wait: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), wait);
    };
  };
  

const MarkdownComponents: Components = {
  code: ({ node, inline, className, children, ...props }: CodeProps) => {
    return (
      <code
        className={`${className || ''} ${
          inline 
            ? 'bg-gray-900/50 text-violet-300 px-1 py-0.5 rounded' 
            : 'block bg-gray-900/50 p-4 rounded-lg border border-violet-500/20'
        }`}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="bg-transparent" {...props}>
      {children}
    </pre>
  )
};

export default function PracticePage() {
  const [problemSpec, setProblemSpec] = useState<ProblemRequest>({
    user_specification: '',
    topic: '',
    difficulty: 'easy',
    language: 'python'
  });
  const [problem, setProblem] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [error, setError] = useState<string>('');

    // Add live tracking effect
    const debouncedTracking = useCallback(
        debounce(async (currentCode: string) => {
          if (!problem || !currentCode) return;
    
          try {
            const response = await fetch('http://localhost:8000/practice/live_tracking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                given_problem: problem,
                topic: problemSpec.topic,
                language: problemSpec.language,
                user_code: currentCode
              } as TrackingRequest),
            });
    
            if (!response.ok) throw new Error('Failed to track progress');
            const data = await response.json();
            setFeedback(data);
          } catch (err) {
            console.error('Tracking error:', err);
          }
        }, 1000), // 1 second delay after stopping typing
        [problem, problemSpec.topic, problemSpec.language]
      );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/practice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemSpec),
      });

      if (!response.ok) throw new Error('Failed to generate problem');
      
      const data = await response.json();
      setProblem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate problem');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyProblem = async (direction: 'easier' | 'harder') => {
    if (!problem) return;
    setModifyLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/practice/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...problemSpec,
          given_problem: problem,
          user_wants: direction
        } as ModifyProblemRequest),
      });

      if (!response.ok) throw new Error('Failed to modify problem');
      
      const data = await response.json();
      setProblem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to modify problem');
    } finally {
      setModifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
            Practice Coding
          </h1>
        </div>

        <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Topic</label>
              <input
                type="text"
                value={problemSpec.topic}
                onChange={e => setProblemSpec(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full bg-gray-900/50 border border-violet-500/20 rounded-lg p-2 text-gray-300"
                placeholder="e.g., loops, arrays, recursion"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Language</label>
              <select
                value={problemSpec.language}
                onChange={e => setProblemSpec(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-gray-900/50 border border-violet-500/20 rounded-lg p-2 text-gray-300"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Difficulty</label>
              <select
                value={problemSpec.difficulty}
                onChange={e => setProblemSpec(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full bg-gray-900/50 border border-violet-500/20 rounded-lg p-2 text-gray-300"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Additional Specifications</label>
              <input
                type="text"
                value={problemSpec.user_specification}
                onChange={e => setProblemSpec(prev => ({ ...prev, user_specification: e.target.value }))}
                className="w-full bg-gray-900/50 border border-violet-500/20 rounded-lg p-2 text-gray-300"
                placeholder="Any specific requirements?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 px-6 py-3 bg-violet-500 text-white rounded-xl 
                       disabled:opacity-50 hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Generating Problem...' : 'Generate Problem'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

     {problem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Display */}
            <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-violet-500/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
                    Problem
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleModifyProblem('easier')}
                      disabled={modifyLoading}
                      className="px-4 py-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 
                               rounded-lg hover:bg-violet-500/30 transition-all disabled:opacity-50 
                               flex items-center gap-2"
                    >
                      <ArrowDown className="w-4 h-4" />
                      Level Down
                    </button>
                    <button
                      onClick={() => handleModifyProblem('harder')}
                      disabled={modifyLoading}
                      className="px-4 py-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 
                               rounded-lg hover:bg-violet-500/30 transition-all disabled:opacity-50
                               flex items-center gap-2"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Level Up
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {modifyLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                  </div>
                ) : (
                  <ReactMarkdown 
                    className="prose prose-invert max-w-none prose-headings:text-violet-300 
                             prose-strong:text-violet-300 prose-pre:bg-transparent prose-pre:p-0"
                    components={MarkdownComponents}
                  >
                    {problem}
                  </ReactMarkdown>
                )}
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="space-y-4">
              <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-violet-500/20">
                  <h3 className="text-lg font-medium text-violet-300">Solution Editor</h3>
                </div>
                <div className="h-[500px]">
                
                    <Editor
                        height="100%"
                        defaultLanguage={problemSpec.language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => {
                        setCode(value || '');
                        debouncedTracking(value || '');
                        }}
                        options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        }}
                    />
                </div>
              </div>

              {/* Feedback Section */}
              {feedback && (
                <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-sm font-medium text-violet-300 mb-2">
                    AI Feedback
                  </h4>
                  <ReactMarkdown 
                    className="prose prose-invert max-w-none text-sm"
                    components={MarkdownComponents}
                  >
                    {feedback}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}