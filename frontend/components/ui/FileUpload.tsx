import { Upload, X } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  value: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  label?: string;
}

export default function FileUpload({
  value,
  onChange,
  onRemove,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className = '',
  label = 'Drag & drop or click to upload',
}: FileUploadProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (acceptedTypes.includes(file.type)) {
        if (file.size <= maxSize) {
          onChange(file);
        } else {
          alert(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
        }
      } else {
        alert('Invalid file type. Allowed: JPEG, PNG, PDF, DOCX');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (acceptedTypes.includes(file.type)) {
        if (file.size <= maxSize) {
          onChange(file);
        } else {
          alert(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
        }
      } else {
        alert('Invalid file type. Allowed: JPEG, PNG, PDF, DOCX');
      }
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {value ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{value.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(value.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 hover:border-accent hover:bg-blue-50/30 rounded-lg p-8 text-center transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept={acceptedTypes.join(',')}
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-gray-700 font-medium">{label}</p>
              <p className="text-xs text-gray-500">
                Accepted: JPEG, PNG, PDF, DOCX (max 10MB)
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}