'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileIcon, Search as SearchIcon, Globe as GlobeIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function KnowledgeGraphPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<null | {
    id: string;
    name: string;
    type: string;
    connections: number;
    description: string;
  }>(null);

  // Sample node data for demonstration
  const mockSelectedNode = {
    id: '1',
    name: 'Product Documentation',
    type: 'Document',
    connections: 8,
    description: 'Comprehensive documentation covering all aspects of our product including features, APIs, and usage examples.'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes('product')) {
      setSelectedNode(mockSelectedNode);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Knowledge Graph">
          <Button variant="outline" size="sm" className="text-sm md:text-base">
            <span className="mr-1">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="text-sm md:text-base">
            <span className="mr-1">Export Graph</span>
          </Button>
          <Button size="sm" className="text-sm md:text-base">
            <span className="mr-1">Refresh</span>
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
          {/* Left Sidebar */}
          <Card className="xl:col-span-3 order-2 xl:order-1">
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Explore Knowledge</CardTitle>
              <CardDescription>Search and navigate nodes</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <SearchIcon size={16} />
                  </span>
                  <Input 
                    placeholder="Search nodes..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Filter by Category</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      Documents
                    </button>
                    <button className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      Procedures
                    </button>
                    <button className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                      People
                    </button>
                    <button className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                      Projects
                    </button>
                    <button className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                      Technical
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Connection Strength</h3>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Weak</span>
                      <span className="text-xs">Strong</span>
                    </div>
                    <input type="range" min="1" max="10" className="w-full" />
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <h3 className="text-sm font-medium">Popular Nodes</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedNode(mockSelectedNode)}
                      className="text-left w-full px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2"
                    >
                      <span><FileIcon className="size-4" /></span>
                      <span>Product Documentation</span>
                    </button>
                    <button className="text-left w-full px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2">
                      <span><FileIcon className="size-4" /></span>
                      <span>Employee Handbook</span>
                    </button>
                    <button className="text-left w-full px-3 py-2 rounded-md hover:bg-muted flex items-center gap-2">
                      <span><FileIcon className="size-4" /></span>
                      <span>Technical Specifications</span>
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Center Graph Visualization */}
          <Card className="xl:col-span-5 order-1 xl:order-2">
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Knowledge Network</CardTitle>
              <CardDescription>Interactive visualization of knowledge relationships</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] md:h-[500px] xl:h-[600px] p-0 relative bg-muted/20 rounded-md flex items-center justify-center">
              {/* This would be a real graph visualization in production */}
              <div className="size-full overflow-hidden">
                {/* Mock of a force-directed graph */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[280px] md:size-[400px]">
                  {/* Center node - would be replaced with actual graph visualization */}
                  <div className={`size-12 md:size-16 rounded-full ${selectedNode ? 'bg-blue-500' : 'bg-gray-400'} flex items-center justify-center text-white font-bold shadow-xl cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                    <span><GlobeIcon className="size-6 md:size-8" /></span>
                  </div>
                  
                  {/* Connecting lines - simplified mock */}
                  <div className="absolute top-[20%] left-[20%] w-[30%] h-px bg-gray-300 rotate-45 origin-bottom-left"></div>
                  <div className="absolute top-[20%] right-[20%] w-[30%] h-px bg-gray-300 -rotate-45 origin-bottom-right"></div>
                  <div className="absolute bottom-[20%] left-[20%] w-[30%] h-px bg-gray-300 -rotate-45 origin-top-left"></div>
                  <div className="absolute bottom-[20%] right-[20%] w-[30%] h-px bg-gray-300 rotate-45 origin-top-right"></div>
                  
                  {/* Satellite nodes - would be actual nodes in real graph */}
                  <div className="absolute top-[5%] left-[5%] size-10 md:size-12 rounded-full bg-blue-400 flex items-center justify-center text-white shadow-md cursor-pointer">
                    <span><FileIcon className="size-4 md:size-5" /></span>
                  </div>
                  <div className="absolute top-[5%] right-[5%] size-10 md:size-12 rounded-full bg-green-400 flex items-center justify-center text-white shadow-md cursor-pointer">
                    <span><FileIcon className="size-4 md:size-5" /></span>
                  </div>
                  <div className="absolute bottom-[5%] left-[5%] size-10 md:size-12 rounded-full bg-purple-400 flex items-center justify-center text-white shadow-md cursor-pointer">
                    <span><FileIcon className="size-4 md:size-5" /></span>
                  </div>
                  <div className="absolute bottom-[5%] right-[5%] size-10 md:size-12 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-md cursor-pointer">
                    <span><FileIcon className="size-4 md:size-5" /></span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="rounded-full size-8 bg-background border flex items-center justify-center shadow-sm">
                    +
                  </button>
                  <button className="rounded-full size-8 bg-background border flex items-center justify-center shadow-sm">
                    -
                  </button>
                </div>
              </div>
              
              {!selectedNode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4 text-center">
                  <span className="mb-4 text-muted-foreground">
                    <GlobeIcon className="size-9" />
                  </span>
                  <h3 className="text-xl md:text-xl font-medium mb-2">Select a Node</h3>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-[250px] md:max-w-sm">
                    Search for a knowledge item or select from popular nodes to visualize its connections.
                  </p>
                  <Button className="mt-4 text-sm" onClick={() => setSelectedNode(mockSelectedNode)}>
                    Show Example
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Sidebar - Details */}
          <Card className="xl:col-span-4 order-3">
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Node Details</CardTitle>
              <CardDescription>Information about selected node</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0 max-h-[600px] overflow-y-auto">
              {selectedNode ? (
                <div className="space-y-5">
                  <div className="p-3 md:p-4 bg-muted rounded-xl flex items-center gap-3">
                    <div className="size-10 md:size-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <span><FileIcon className="size-5 md:size-6" /></span>
                    </div>
                    <div>
                      <h3 className="font-medium text-base md:text-xl">{selectedNode.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{selectedNode.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm md:text-base font-medium">Description</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {selectedNode.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm md:text-base font-medium">Connections ({selectedNode.connections})</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-green-400 flex items-center justify-center text-white">
                            <span><FileIcon className="size-3" /></span>
                          </div>
                          <span className="text-xs md:text-sm">API Documentation</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Related</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-purple-400 flex items-center justify-center text-white">
                            <span><FileIcon className="size-3" /></span>
                          </div>
                          <span className="text-xs md:text-sm">User Guide</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Part of</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-amber-400 flex items-center justify-center text-white">
                            <span><FileIcon className="size-3" /></span>
                          </div>
                          <span className="text-xs md:text-sm">Technical Specs</span>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">References</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm md:text-base font-medium">Metadata</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-xs md:text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>Apr 15, 2023</span>
                      <span className="text-muted-foreground">Modified</span>
                      <span>Jun 22, 2023</span>
                      <span className="text-muted-foreground">Author</span>
                      <span>John Doe</span>
                      <span className="text-muted-foreground">Format</span>
                      <span>PDF Document</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="text-xs md:text-sm">View Content</Button>
                    <Button className="text-xs md:text-sm">Edit Connections</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-[300px] md:h-[400px]">
                  <span className="text-muted-foreground mb-4">
                    <FileIcon className="size-8" />
                  </span>
                  <h3 className="font-medium mb-1">No Node Selected</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Select a node from the visualization to view its details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 