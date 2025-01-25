import { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (files: File[]) => void;
}

export const FileUpload = ({ label, accept, onChange }: FileUploadProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            Click to upload {label}
          </span>
        </label>
      </div>
    </div>
  );
};