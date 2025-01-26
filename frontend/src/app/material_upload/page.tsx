'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/FileUpload';
import { MaterialData, TopicResponse, Topic } from '@/types/types';

const parseTopicList = (text: string): Topic[] => {
  return text.split('\n').reduce((acc: Topic[], line) => {
    const mainTopicMatch = line.match(/^\d+\.\s(.+)/);
    if (mainTopicMatch) {
      acc.push({ title: mainTopicMatch[1], subtopics: [] });
    } else {
      const subtopicMatch = line.match(/^\s*-\s(.+)/);
      if (subtopicMatch && acc.length > 0) {
        acc[acc.length - 1].subtopics?.push(subtopicMatch[1]);
      }
    }
    return acc;
  }, []);
};

export default function MaterialUploadPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialData>({
    topic: '',
    question: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TopicResponse | null>(null);
  const [weblink, setWeblink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sourcesResponse = await fetch('http://localhost:8000/newcontent/load_sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: materials.weblinks || []
        }),
      });

      if (!sourcesResponse.ok) throw new Error('Failed to load sources');

      const topicsResponse = await fetch('http://localhost:8000/newcontent/topic_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specific_section: materials.question,
          chat_history: [{
            role: "system",
            content: "You are a topic list creator. Given the context generate a topic list with bulletin points. Dont generate anything else."
          }]
        }),
      });

      if (!topicsResponse.ok) throw new Error('Failed to generate topics');
      
      const data = await topicsResponse.json();
      setResponse({ answer: data.response, error: '' });
    } catch (error) {
      setResponse({ 
        answer: '', 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    const chatHistory = [{
      role: "human",
      content: "You are a mentor who teaches step-by-step, interactively and adaptively. Use the provided context to explain the topic clearly. Also generate a question after each time u are teaching something"
    }];

    const queryParams = new URLSearchParams({
      topic: encodeURIComponent(topic),
      chatHistory: encodeURIComponent(JSON.stringify(chatHistory))
    }).toString();

    router.push(`/topic-details?${queryParams}`);
  };

  const addWeblink = () => {
    if (weblink) {
      setMaterials(prev => ({
        ...prev,
        weblinks: [...(prev.weblinks || []), weblink]
      }));
      setWeblink('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
          Upload Learning Materials
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <FileUpload
              label="PDFs (Optional)"
              accept=".pdf"
              onChange={paths => setMaterials(prev => ({ ...prev, pdfs: paths }))}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Weblinks</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={weblink}
                  onChange={e => setWeblink(e.target.value)}
                  className="flex-1 bg-gray-900/50 border border-violet-500/20 rounded-lg p-2 text-gray-300"
                  placeholder="Enter URL"
                />
                <button
                  type="button"
                  onClick={addWeblink}
                  className="px-4 py-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 
                           rounded-lg hover:bg-violet-500/30 transition-all"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {materials.weblinks?.map((link, i) => (
                  <li key={i} className="text-sm text-gray-400 bg-gray-900/50 rounded-lg p-2">
                    {link}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Question <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={materials.question}
                onChange={e => setMaterials(prev => ({ ...prev, question: e.target.value }))}
                className="w-full bg-gray-900/50 border border-violet-500/20 rounded-lg p-4 min-h-[100px] text-gray-300"
                placeholder="What would you like to learn about?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !materials.question}
            className="w-full px-6 py-3 bg-violet-500 text-white rounded-xl 
                     disabled:opacity-50 hover:bg-violet-600 transition-all"
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        )}

        {response && !response.error && (
          <div className="mt-8">
            <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-violet-500/20">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
                  Learning Topics
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {parseTopicList(response.answer).map((topic, index) => (
                    <div key={index}>
                      <div 
                        onClick={() => handleTopicClick(topic.title)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-violet-500/10 
                                 border border-violet-500/20 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-violet-500/20 rounded-full 
                                    flex items-center justify-center border border-violet-400/30">
                          <span className="text-violet-300 font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-lg">{topic.title}</p>
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {topic.subtopics.map((subtopic, sIdx) => (
                                <li key={sIdx} className="text-sm text-gray-400 ml-4">
                                  • {subtopic}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {response?.error && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{response.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}