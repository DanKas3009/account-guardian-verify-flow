
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileType } from "@/types/validation";
import { toast } from "@/components/ui/sonner";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isUploading,
  progress,
  acceptedFileTypes = [".csv", ".json", ".xml"],
  maxSizeMB = 10
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): { isValid: boolean; errorMessage?: string } => {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    // Check file type
    if (!acceptedFileTypes.includes(fileExtension)) {
      return {
        isValid: false,
        errorMessage: `Invalid file type. Accepted types: ${acceptedFileTypes.join(", ")}`
      };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        errorMessage: `File is too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    return { isValid: true };
  };

  const getFileTypeFromExtension = (fileName: string): FileType => {
    const extension = fileName.split('.').pop()?.toLowerCase() || "";
    
    if (extension === "csv") return "csv";
    if (extension === "json") return "json";
    if (extension === "xml") return "xml";
    return "unknown";
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validation = validateFile(file);
      
      if (validation.isValid) {
        onFileUpload(file);
      } else {
        toast.error(validation.errorMessage || "Invalid file");
      }
    }
  }, [onFileUpload, acceptedFileTypes, maxSizeBytes, maxSizeMB]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      
      if (validation.isValid) {
        onFileUpload(file);
      } else {
        toast.error(validation.errorMessage || "Invalid file");
      }
    }
  }, [onFileUpload, acceptedFileTypes, maxSizeBytes, maxSizeMB]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`file-drop-zone ${isDragActive ? "active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileSelect}
        />
        
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M24 8l-8 8h6v14h4V16h6l-8-8z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 32v4h24v-4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {isDragActive ? "Drop the file here" : "Drop file or click to upload"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: CSV, JSON, XML (max {maxSizeMB}MB)
          </p>
          {!isUploading && (
            <Button
              className="mt-4"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              Browse files
            </Button>
          )}
        </div>

        {isUploading && (
          <div className="mt-6 w-full">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
