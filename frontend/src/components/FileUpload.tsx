'use client';

import { useState } from 'react';
import type { UploadResponse } from '../types/types';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (paths: string[]) => void;
}

export const FileUpload = ({ label, accept, onChange }: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    setLoading(true);
    setError(null);
    const fileArray = Array.from(files);
    const paths: string[] = [];

    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        
        const data = await response.json() as UploadResponse;
        paths.push(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`);
      }

      setUploadedFiles(prev => [...prev, ...paths]);
      onChange(paths);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        multiple
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                  file:text-sm file:font-semibold file:bg-violet-500/20 
                  file:text-violet-300 hover:file:bg-violet-500/30
                  text-gray-300 cursor-pointer border border-violet-500/20 
                  rounded-lg p-2"
        disabled={loading}
      />
      {loading && <div className="text-sm text-violet-400">Uploading...</div>}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {error}
        </div>
      )}
      <ul className="space-y-2">
        {uploadedFiles.map((path, i) => (
          <li key={i} className="text-sm text-gray-400 bg-gray-900/50 rounded-lg p-2">
            {path.split('/').pop()}
          </li>
        ))}
      </ul>
    </div>
  );
};