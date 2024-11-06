import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onProcessingStart,
  onProcessingComplete
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    onProcessingStart();
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress(progress);
      }
    };

    reader.onload = async () => {
      const content = reader.result as string;
      setTimeout(() => {
        onFileUpload(content);
        setIsUploading(false);
        onProcessingComplete();
      }, 1000);
    };

    reader.readAsText(file);
  }, [onFileUpload, onProcessingStart, onProcessingComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.pdf', '.doc', '.docx']
    },
    multiple: false
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop a file here, or click to select a file'}
        </p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
};