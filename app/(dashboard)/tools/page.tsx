'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileIcon, UploadIcon, DownloadIcon, CrossIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';

// File type validation
const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain", // TXT
];

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ToolsPage() {
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

  // Validate and add files
  const validateAndAddFiles = (files: File[]) => {
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
  };

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
  }, [selectedFiles]);

  // Remove a file from selection
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});
    setUploadResults([]);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      });

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/knowledge-base/upload', true);
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          const newProgress = { ...uploadProgress };
          selectedFiles.forEach((file) => {
            newProgress[file.name] = percentComplete;
          });
          setUploadProgress(newProgress);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setUploadResults(result.sources || []);
          
          // Update progress to 100% for all files
          const completedProgress = { ...uploadProgress };
          selectedFiles.forEach((file) => {
            completedProgress[file.name] = 100;
          });
          setUploadProgress(completedProgress);
          
          toast.success(`Successfully uploaded ${selectedFiles.length} file(s) to the knowledge base`);
          
          // Clear selected files after successful upload
          setSelectedFiles([]);
        } else {
          console.error('Error uploading files:', xhr.statusText);
          toast.error('Failed to upload files: ' + xhr.statusText);
        }
        setUploading(false);
      };
      
      xhr.onerror = function() {
        console.error('Error uploading files');
        toast.error('Failed to upload files: Network error');
        setUploading(false);
      };
      
      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files: " + (error as Error).message);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Import/Export Tools">
        </PageHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Import Knowledge */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Import Knowledge</CardTitle>
              <CardDescription>
                Add content to your knowledge base from external sources
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-4">
                {/* Drag and drop area */}
                <div
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
                          key={index}
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
                        <div key={index} className="p-2">
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
                            onClick={() =>
                              (window.location.href = `/knowledge-base/${result.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2">Import Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm" htmlFor="auto-categorize">Auto-categorize content</label>
                      <input type="checkbox" id="auto-categorize" className="rounded border-input" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm" htmlFor="extract-metadata">Extract metadata</label>
                      <input type="checkbox" id="extract-metadata" className="rounded border-input" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs md:text-sm" htmlFor="dedup">Remove duplicates</label>
                      <input type="checkbox" id="dedup" className="rounded border-input" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button
                size="sm"
                disabled={selectedFiles.length === 0 || uploading}
                className="w-full"
                onClick={uploadFiles}
              >
                {uploading ? "Uploading..." : "Import Now"}
              </Button>
            </CardFooter>
          </Card>

          {/* Export Knowledge */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Export Knowledge</CardTitle>
              <CardDescription>
                Export your knowledge base for backup or transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Export Format</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="justify-start text-xs md:text-sm py-1 h-auto md:h-10">
                    <span className="mr-2"><FileIcon size={16} /></span>
                    JSON
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start text-xs md:text-sm py-1 h-auto md:h-10">
                    <span className="mr-2"><FileIcon size={16} /></span>
                    CSV
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start text-xs md:text-sm py-1 h-auto md:h-10">
                    <span className="mr-2"><FileIcon size={16} /></span>
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start text-xs md:text-sm py-1 h-auto md:h-10">
                    <span className="mr-2"><FileIcon size={16} /></span>
                    Markdown
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Content Selection</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="all-content" name="content-selection" className="mr-2" defaultChecked />
                    <label className="text-xs md:text-sm" htmlFor="all-content">All knowledge content</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="selected-categories" name="content-selection" className="mr-2" />
                    <label className="text-xs md:text-sm" htmlFor="selected-categories">Selected categories</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="date-range" name="content-selection" className="mr-2" />
                    <label className="text-xs md:text-sm" htmlFor="date-range">Date range</label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Export Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs md:text-sm" htmlFor="include-metadata">Include metadata</label>
                    <input type="checkbox" id="include-metadata" className="rounded border-input" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs md:text-sm" htmlFor="include-usage-stats">Include usage statistics</label>
                    <input type="checkbox" id="include-usage-stats" className="rounded border-input" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button size="sm" className="w-full text-xs md:text-sm">
                <span className="mr-2"><DownloadIcon size={16} /></span>
                Export Knowledge Base
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* More Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Process multiple files at once</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Upload multiple documents for automated processing and knowledge extraction.
              </p>
              <div className="flex justify-center">
                <span><UploadIcon size={32} /></span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Start Batch Processing</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Integration Connectors</CardTitle>
              <CardDescription>Connect to external systems</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Import knowledge directly from connected systems like Slack, Google Drive, or Microsoft 365.
              </p>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
                  <span className="text-xl">S</span>
                </div>
                <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
                  <span className="text-xl">G</span>
                </div>
                <div className="flex justify-center items-center aspect-square rounded bg-primary/10">
                  <span className="text-xl text-primary">SP</span>
                </div>
                <div className="flex justify-center items-center aspect-square rounded bg-primary/10">
                  <span className="text-xl text-primary">OD</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Configure Integrations</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Data Cleanup</CardTitle>
              <CardDescription>Maintenance tools</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Clean up redundant or outdated knowledge entries to keep your knowledge base relevant.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">Unused entries</span>
                  <span className="text-xs md:text-sm">23 items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">Duplicate content</span>
                  <span className="text-xs md:text-sm">7 items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm">Outdated ({'>'}1yr)</span>
                  <span className="text-xs md:text-sm">12 items</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
              <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Run Cleanup Tools</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recently Processed */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Recently Processed</CardTitle>
            <CardDescription>Latest import and export activities</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">File Name</th>
                    <th className="py-3 px-4 text-left font-medium">Type</th>
                    <th className="py-3 px-4 text-left font-medium">User</th>
                    <th className="py-3 px-4 text-left font-medium">Date</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">company_handbook.pdf</td>
                    <td className="py-3 px-4">Import</td>
                    <td className="py-3 px-4">Jane Smith</td>
                    <td className="py-3 px-4">Today, 11:23 AM</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">knowledge_export_06152023.json</td>
                    <td className="py-3 px-4">Export</td>
                    <td className="py-3 px-4">John Doe</td>
                    <td className="py-3 px-4">Yesterday, 2:45 PM</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">quarterly_reports.zip</td>
                    <td className="py-3 px-4">Import</td>
                    <td className="py-3 px-4">Robert Williams</td>
                    <td className="py-3 px-4">Jun 12, 2023</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">Retry</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">company_handbook.pdf</h3>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span>Import</span>
                  <span className="text-muted-foreground">User:</span>
                  <span>Jane Smith</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>Today, 11:23 AM</span>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">View</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">export_06152023.json</h3>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span>Export</span>
                  <span className="text-muted-foreground">User:</span>
                  <span>John Doe</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>Yesterday, 2:45 PM</span>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">Download</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">quarterly_reports.zip</h3>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                    Failed
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span>Import</span>
                  <span className="text-muted-foreground">User:</span>
                  <span>Robert Williams</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>Jun 12, 2023</span>
                </div>
                <div className="pt-2 border-t flex justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">Retry</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}