'use client';

import { useState } from 'react';
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
import { FileIcon, UploadIcon, DownloadIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';

export default function ToolsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const simulateImport = () => {
    if (!selectedFile) return;
    
    setImporting(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
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
                <div className="border border-dashed rounded-lg p-4 md:p-8 flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <span><UploadIcon size={32} /></span>
                  </div>
                  <p className="text-xs md:text-sm text-center mb-4">
                    Drag and drop files here, or click to select files
                  </p>
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <Button size="sm" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    Select Files
                  </Button>
                  {selectedFile && (
                    <div className="mt-4 flex items-center gap-2">
                      <span><FileIcon size={16} /></span>
                      <span className="text-xs md:text-sm">{selectedFile.name}</span>
                    </div>
                  )}
                </div>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm">Importing...</span>
                      <span className="text-xs md:text-sm">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${progress}%` }}
                      />
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
                disabled={!selectedFile || importing} 
                className="w-full"
                onClick={simulateImport}
              >
                Import Now
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
                Import knowledge directly from connected systems like Slack, Google Drive, or Notion.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
                  <span className="text-xl">S</span>
                </div>
                <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
                  <span className="text-xl">G</span>
                </div>
                <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
                  <span className="text-xl">N</span>
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
                  <h3 className="font-medium text-sm">knowledge_export_06152023.json</h3>
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