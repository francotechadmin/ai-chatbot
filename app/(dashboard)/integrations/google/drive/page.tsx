'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeftIcon, FileIcon, FolderIcon, RefreshIcon } from '@/components/icons';

// Interface for file/folder items
interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

// Interface for knowledge bases
interface KnowledgeBase {
  id: string;
  name: string;
}

export default function GoogleDrivePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [path, setPath] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string; name: string}[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  // Removed knowledgeBases state since we only have one knowledge base
  // Keeping selectedKB as a hidden state that will be populated automatically
  const [selectedKB, setSelectedKB] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load knowledge base - modified to just get the single knowledge base ID
  useEffect(() => {
    async function fetchKnowledgeBase() {
      try {
        const response = await fetch('/api/knowledge');
        if (response.ok) {
          const data = await response.json();
          if (data.knowledgeBases?.length > 0) {
            setSelectedKB(data.knowledgeBases[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load knowledge base:', err);
      }
    }

    fetchKnowledgeBase();
  }, []);

  // Load folder contents
  useEffect(() => {
    loadFolder(currentFolder);
  }, [currentFolder]);

  const loadFolder = async (folderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/integrations/google/drive?folderId=${folderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load folder contents');
      }
      
      const data = await response.json();
      setItems(data.files || []);
    } catch (err) {
      console.error('Error loading folder:', err);
      setError('Failed to load files from Google Drive. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToFolder = (item: DriveItem) => {
    const newBreadcrumbs = [...breadcrumbs, { id: item.id, name: item.name }];
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(item.id);
    setSelectedFiles([]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setSelectedFiles([]);
  };

  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFolder(currentFolder);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/integrations/google/drive/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setItems(data.files || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0 || !selectedKB) {
      return;
    }

    setIsImporting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/google/drive/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: selectedFiles,
          knowledgeBaseId: selectedKB,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      router.push(`/knowledge-base`);
      
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import files. Please try again.');
      setIsImporting(false);
    }
  };

  const formatFileSize = (sizeInBytes?: string): string => {
    if (!sizeInBytes) return 'Unknown';
    
    const size = parseInt(sizeInBytes, 10);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const isFolder = (item: DriveItem): boolean => {
    return item.mimeType === 'application/vnd.google-apps.folder';
  };

  const canImport = (item: DriveItem): boolean => {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    return supportedTypes.includes(item.mimeType);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Google Drive Files">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <span className="mr-2">
                <ArrowLeftIcon size={16} />
              </span>
               Back
            </Button>
            <Button variant="outline" onClick={() => loadFolder(currentFolder)}>
              <span className="mr-2">
              <RefreshIcon size={16} />
              </span>
               Refresh
            </Button>
          </div>
        </PageHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleImport}
                  disabled={selectedFiles.length === 0 || !selectedKB || isImporting}
                >
                  {isImporting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Importing...
                    </>
                  ) : (
                    `Import ${selectedFiles.length} Files`
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground my-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.id} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <button
                className="hover:text-blue-600 hover:underline"
                onClick={() => navigateToBreadcrumb(index)}
              >
                {breadcrumb.name}
              </button>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner className="size-8" />
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                This folder is empty.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-12">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {!isFolder(item) && canImport(item) && (
                            <Checkbox
                              checked={selectedFiles.includes(item.id)}
                              onCheckedChange={() => toggleFileSelection(item.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isFolder(item) ? (
                              <span className="text-amber-500">
                                <FolderIcon size={16} />
                              </span>
                            ) : (
                              <span className="text-blue-500">
                                <FileIcon size={16} />
                              </span>
                            )}
                            {isFolder(item) ? (
                              <button
                                className="hover:text-blue-600 hover:underline"
                                onClick={() => navigateToFolder(item)}
                              >
                                {item.name}
                              </button>
                            ) : (
                              <span>{item.name}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isFolder(item)
                            ? 'Folder'
                            : item.mimeType.split('/').pop() || item.mimeType}
                        </TableCell>
                        <TableCell>{formatDate(item.modifiedTime)}</TableCell>
                        <TableCell>{isFolder(item) ? '-' : formatFileSize(item.size)}</TableCell>
                        <TableCell>
                          {item.webViewLink && (
                            <a
                              href={item.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}