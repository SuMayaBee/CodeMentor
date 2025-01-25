'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MaterialData, UploadResponse } from '@/types/types';

export default function MaterialUploadPage() {
    const [materials, setMaterials] = useState<MaterialData>({
        pdfs: [],
        slides: [],
        videos: [],
        weblinks: [],
        topic: '',     // Added topic
        question: '',
      });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [weblink, setWeblink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materials.topic || !materials.question) {
        alert('Please enter both topic and question');
        return;
      }

    setLoading(true);
    try {
      const formData = new FormData();
      materials.pdfs?.forEach(pdf => formData.append('pdfs', pdf));
      materials.slides?.forEach(slide => formData.append('slides', slide));
      materials.videos?.forEach(video => formData.append('videos', video));
      formData.append('weblinks', JSON.stringify(materials.weblinks));
      formData.append('question', materials.question);
      formData.append('topic', materials.topic);
      formData.append('question', materials.question);

      const res = await fetch('/api/analyze-materials', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ answer: '', error: 'Failed to process materials' });
    } finally {
      setLoading(false);
    }
  };

  const addWeblink = () => {
    if (weblink) {
      setMaterials(prev => ({
        ...prev,
        weblinks: [...(prev.weblinks || []), weblink],
      }));
      setWeblink('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Learning Materials</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            label="PDFs"
            accept=".pdf"
            onChange={files => setMaterials(prev => ({ ...prev, pdfs: files }))}
          />
          <FileUpload
            label="Slides"
            accept=".ppt,.pptx"
            onChange={files => setMaterials(prev => ({ ...prev, slides: files }))}
          />
          <FileUpload
            label="Videos"
            accept="video/*"
            onChange={files => setMaterials(prev => ({ ...prev, videos: files }))}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Weblinks</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={weblink}
                onChange={e => setWeblink(e.target.value)}
                className="flex-1 border rounded-lg p-2"
                placeholder="Enter URL"
              />
              <button
                type="button"
                onClick={addWeblink}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <ul className="list-disc list-inside">
              {materials.weblinks?.map((link, i) => (
                <li key={i} className="text-sm text-gray-600">{link}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Topic Input - New Addition */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={materials.topic}
            onChange={e => setMaterials(prev => ({ ...prev, topic: e.target.value }))}
            className="w-full border rounded-lg p-2"
            placeholder="Enter the topic..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={materials.question}
            onChange={e => setMaterials(prev => ({ ...prev, question: e.target.value }))}
            className="w-full border rounded-lg p-2 min-h-[100px]"
            placeholder="Ask a question about the materials..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !materials.question}
          className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {loading && (
        <div className="mt-6">
          <LoadingSpinner />
          <p className="text-center mt-2">Analyzing materials...</p>
        </div>
      )}

      {response && (
        <div className="mt-6 p-4 border rounded-lg">
          {response.error ? (
            <p className="text-red-500">{response.error}</p>
          ) : (
            <div>
              <h2 className="font-semibold mb-2">Answer:</h2>
              <p className="whitespace-pre-wrap">{response.answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}