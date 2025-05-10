'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadIcon, CrossIcon, FileIcon } from '@/components/icons';
import { toast } from 'sonner';
import { uploadFiles as uploadFilesAction } from '../actions';

// File type validation
const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain", // TXT
];

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploaderProps {
  onUploadComplete?: (results: any[]) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      validateAndAddFiles(newFiles);
    }
  };

  // Validate and add files - wrapped in useCallback to prevent recreation on every render
  const validateAndAddFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];

    files.forEach((file) => {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        invalidFiles.push({
          name: file.name,
          reason: "Invalid file type. Only PDF, DOCX, and TXT files are allowed.",
        });
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          name: file.name,
          reason: "File size exceeds the 10MB limit.",
        });
        return;
      }

      // Check for duplicates
      if (selectedFiles.some((f) => f.name === file.name)) {
        invalidFiles.push({
          name: file.name,
          reason: "File already selected.",
        });
        return;
      }

      validFiles.push(file);
    });

    // Show errors for invalid files
    invalidFiles.forEach((file) => {
      toast.error(`${file.name}: ${file.reason}`);
    });

    // Add valid files to the selection
    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  }, [selectedFiles]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(newFiles);
    }
  }, [validateAndAddFiles]);

  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file type icon based on file extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <span className="text-red-500"><FileIcon size={16} /></span>;
      case "docx":
      case "doc":
        return <span className="text-blue-500"><FileIcon size={16} /></span>;
      case "txt":
      case "md":
        return <span className="text-gray-500"><FileIcon size={16} /></span>;
      default:
        return <FileIcon size={16} />;
    }
  };


  // Upload files to the server
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});
    setUploadResults([]);

    try {
      const formData = new FormData();

      // Add files to FormData
      selectedFiles.forEach((file) => {
        formData.append("files", file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      });

      // Simulate progress updates since server actions don't provide progress events
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          Object.keys(newProgress).forEach(fileName => {
            // Increment by random amount between 5-15% until 90%
            if (newProgress[fileName] < 90) {
              newProgress[fileName] = Math.min(90, newProgress[fileName] + Math.floor(Math.random() * 10) + 5);
            }
          });
          return newProgress;
        });
      }, 500);

      // Call the server action
      const result = await uploadFilesAction(formData);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      if (result.success) {
        const resultSources = result.sources || [];
        setUploadResults(resultSources);
        
        // Update progress to 100% for all files
        const completedProgress = { ...uploadProgress };
        selectedFiles.forEach((file) => {
          completedProgress[file.name] = 100;
        });
        setUploadProgress(completedProgress);
        
        toast.success(`Successfully uploaded ${selectedFiles.length} file(s) to the knowledge base`);
        
        // Clear selected files after successful upload
        setSelectedFiles([]);
        
        // Notify parent component of upload completion
        if (onUploadComplete) {
          onUploadComplete(resultSources);
        }
      } else {
        console.error('Error uploading files:', result.error);
        toast.error(`Failed to upload files: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(`Failed to upload files: ${(error as Error).message}`);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and drop area */}
      <div
        role="region"
        aria-label="File drop zone"
        className="border border-dashed rounded-lg p-4 md:p-8 flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <UploadIcon size={32} />
        </div>
        <p className="text-xs md:text-sm text-center mb-4">
          Drag and drop files here, or click to select files
        </p>
        <Input
          type="file"
          className="hidden"
          id="file-upload"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={uploading}
        >
          Select Files
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: PDF, DOCX, TXT (Max 10MB per file)
        </p>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="border rounded-md divide-y">
            {selectedFiles.map((file, index) => (
              <div
                key={`file-${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(file.name)}
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <CrossIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Upload Progress</h3>
          {Object.entries(uploadProgress).map(
            ([fileName, progress]) => (
              <div key={fileName} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs truncate max-w-[200px]">
                    {fileName}
                  </span>
                  <span className="text-xs">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Upload results */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Upload Results</h3>
          <div className="border rounded-md divide-y">
            {uploadResults.map((result, index) => (
              <div key={`result-${result.id || result.fileName}-${index}`} className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {result.title || result.fileName}
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Added to knowledge base, awaiting approval
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs"
                  onClick={() => {
                    window.location.href = `/knowledge-base/${result.id}`;
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        size="sm"
        disabled={selectedFiles.length === 0 || uploading}
        className="w-full"
        onClick={handleUpload}
      >
        {uploading ? "Uploading..." : "Import Now"}
      </Button>
    </div>
  );
}