'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessage {
  role: 'human' | 'ai';
  content: string;
}

const formatMarkdown = (text: string) => {
    // Split by headers
    return text.split(/(?=###)/).map((section, index) => {
      const [header, ...content] = section.trim().split('\n');
      const headerLevel = (header.match(/#/g) || []).length;
      
      return (
        <div key={index} className="mb-8">
          {header.startsWith('#') && (
            <h2 
              className={`${
                headerLevel === 3 
                  ? 'text-2xl mb-6' 
                  : 'text-xl mb-4'
              } font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300`}
            >
              {header.replace(/#{3,4}\s/, '')}
            </h2>
          )}
          <div className="space-y-4">
            {content.map((paragraph, pIdx) => (
              <div key={pIdx}>
                {paragraph.startsWith('- ') ? (
                  <li className="ml-4 text-gray-300">
                    {formatText(paragraph.substring(2))}
                  </li>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    {formatText(paragraph)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

// Add this helper function
const formatResponse = (text: string) => {
    const sections = text.split('###').filter(Boolean);
    return sections.map(section => {
      const [title, ...content] = section.trim().split('\n');
      return { title, content: content.join('\n') };
    });
  };

  const parseMCQs = (content: string): MCQ[] => {
    const questions = content.match(/<<([\s\S]*?)>>/g) || [];
    return questions.map(q => {
      const questionText = q.replace(/<<|>>/g, '').split('\n')[0].trim();
      const options = q
        .match(/\*[a-d]\)(.*?)(?=\*[a-d]\)|$)/g)
        ?.map(opt => opt.replace(/^\*[a-d]\)/, '').trim()) || [];
      return {
        question: questionText,
        options: options
      };
    });
  };
  
  interface MCQAnswer {
    questionId: string;
    selectedOption: string;
  }

  interface MCQ {
    question: string;
    options: string[];
  }

  const parseContent = (content: string): string => {
    // Remove content between (( and ))
    return content.replace(/\(\([\s\S]*?\)\)/g, '');
  };

  

  


  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span 
            key={index}
            className="font-bold text-violet-300 border-b border-violet-500/30 px-1 shadow-[0_2px_0_rgba(139,92,246,0.2)]"
          >
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={index} className="text-white/90">{part}</span>;
    });
  };

export default function TopicDetailsPage() {
  const searchParams = useSearchParams();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
        "role": "ai",
        "content": "You are a mentor who teaches step-by-step, interactively and adaptively. Use the provided context to explain the topic clearly. Also generate a question after each time u are teaching something"
    }])
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<MCQAnswer[]>([]);

  const topic = searchParams.get('topic');
  const materials = JSON.parse(decodeURIComponent(searchParams.get('materials') || '{}'));


  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/newcontent/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: "Start teaching about this topic",
            topic: topic,
            chat_history: []
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response');
        }

        const data = await response.json();
        console.log(data);
        setChatHistory(data.chat_history);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      initializeChat();
    }
  }, [topic]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setSelectedAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId ? { ...a, selectedOption: option } : a
        );
      }
      return [...prev, { questionId, selectedOption: option }];
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Add submitAnswers function
  const submitAnswers = async () => {
    setLoading(true);
    try {
      const formattedAnswers = selectedAnswers
        .map((ans, idx) => `Q${idx + 1}: ${ans.selectedOption}`)
        .join(', ');
  
      const response = await fetch('http://localhost:8000/newcontent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `My answers are: ${formattedAnswers}`,
          topic: topic,
          chat_history: chatHistory
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }
  
      const data = await response.json();
      // Replace chat history with new response instead of appending
      setChatHistory([
        {
          role: 'ai',
          content: data.response
        }
      ]);
      setSelectedAnswers([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
          {topic}
        </h1>
  
        <div className="grid grid-cols-12 gap-6">
          {/* Content Panel */}
          <div className="col-span-8 space-y-6">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              >
                {msg.role === 'ai' && (
                  <>
                    {parseContent(msg.content).split('```').map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        const [lang, ...code] = part.split('\n');
                        return (
                          <div key={pIdx} className="relative my-6 group">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigator.clipboard.writeText(code.join('\n'))}
                                className="px-3 py-1.5 text-sm bg-violet-500/20 border border-violet-400/30 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-all"
                              >
                                Copy
                              </button>
                            </div>
                            <div className="bg-gray-950/50 rounded-xl overflow-hidden">
                              <div className="flex items-center px-4 py-2 border-b border-violet-500/20">
                                <span className="text-sm text-violet-400">{lang || 'python'}</span>
                              </div>
                              <SyntaxHighlighter
                                language={lang || 'python'}
                                style={atomDark}
                                className="!bg-transparent !m-0 p-4"
                              >
                                {code.join('\n')}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={pIdx} className="space-y-6">
                          {formatMarkdown(part)}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            ))}
            
            {/* Submit Button */}
            <div className="sticky bottom-6 flex justify-between">
    {selectedAnswers.length > 0 && (
      <button
        onClick={submitAnswers}
        disabled={loading}
        className="px-6 py-3 bg-violet-500/20 border border-violet-400/30 text-violet-300 
                 rounded-xl disabled:opacity-50 hover:bg-violet-500/30 
                 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            <span>Submitting...</span>
          </div>
        ) : (
          'Submit Answers'
        )}
      </button>
    )}
    
    <button
      onClick={() => {
        const queryParams = new URLSearchParams({
          chatHistory: encodeURIComponent(JSON.stringify(chatHistory))
        }).toString();
        window.location.href = `/quiz?${queryParams}`;
      }}
      className="px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 
                 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all"
    >
      Take Quiz
    </button>
  </div>
          </div>
  
          {/* Questions Panel */}
          <div className="col-span-4">
            <div className="sticky top-6">
              <div className="bg-gray-900/30 border border-violet-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-violet-300 mb-6 border-b border-violet-500/20 pb-2">
                  Questions
                </h2>
                <div className="space-y-6">
                  {chatHistory.map((msg, index) => 
                    msg.role === 'ai' && parseMCQs(msg.content).map((mcq, mcqIndex) => {
                      const questionId = `question-${index}-${mcqIndex}`;
                      const selectedAnswer = selectedAnswers.find(a => a.questionId === questionId)?.selectedOption;
  
                      return (
                        <div key={questionId} className="mb-6 bg-gray-900/20 p-4 rounded-xl border border-violet-500/10">
                          <p className="text-white/90 font-medium mb-4">{mcq.question}</p>
                          <div className="space-y-2">
                            {mcq.options.map((option, optIndex) => (
                              <label
                                key={optIndex}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  selectedAnswer === option
                                    ? 'bg-violet-500/20 border border-violet-400/30'
                                    : 'hover:bg-violet-500/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={questionId}
                                  checked={selectedAnswer === option}
                                  onChange={() => handleOptionSelect(questionId, option)}
                                  className="w-4 h-4 text-violet-500 bg-gray-900 border-violet-400/30"
                                />
                                <span className={`${
                                  selectedAnswer === option ? 'text-violet-300' : 'text-gray-300'
                                }`}>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}