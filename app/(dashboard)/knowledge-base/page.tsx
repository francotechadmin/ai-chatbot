'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EyeIcon, PlusIcon, CrossIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { FileIcon } from 'lucide-react';

// Mock data for demonstration
const pendingSessions = [
  { id: '1', title: 'Product Documentation', date: '2023-05-15', confidence: 'High', source: 'Knowledge Capture' },
  { id: '2', title: 'Customer Support Guidelines', date: '2023-05-16', confidence: 'Medium', source: 'Knowledge Capture' },
  { id: '3', title: 'Technical Specifications', date: '2023-05-17', confidence: 'Low', source: 'File Upload' },
];

const approvedKnowledge = [
  { id: '1', title: 'Company Values', date: '2023-05-10', usage: 'High', type: 'Document' },
  { id: '2', title: 'Employee Handbook', date: '2023-05-11', usage: 'Medium', type: 'Document' },
  { id: '3', title: 'API Documentation', date: '2023-05-12', usage: 'High', type: 'Technical' },
];

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState('pending');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'pending':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Sessions Pending Approval</CardTitle>
              <CardDescription>
                Review and approve knowledge sessions to add them to the knowledge graph.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left font-medium">Title</th>
                      <th className="py-2 px-4 text-left font-medium">Date</th>
                      <th className="py-2 px-4 text-left font-medium">Source</th>
                      <th className="py-2 px-4 text-left font-medium">Confidence</th>
                      <th className="py-2 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSessions.map((session) => (
                      <tr key={session.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{session.title}</td>
                        <td className="py-2 px-4">{session.date}</td>
                        <td className="py-2 px-4">{session.source}</td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            session.confidence === 'High' ? 'bg-green-100 text-green-800' : 
                            session.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.confidence}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" title="View">
                              <EyeIcon size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-500" title="Approve">
                              <PlusIcon size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" title="Reject">
                              <CrossIcon size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile view - Cards */}
              <div className="md:hidden space-y-4">
                {pendingSessions.map((session) => (
                  <div key={session.id} className="border rounded-md p-4 space-y-3 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{session.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.confidence === 'High' ? 'bg-green-100 text-green-800' : 
                        session.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.confidence}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{session.date}</span>
                      <span className="text-muted-foreground">Source:</span>
                      <span>{session.source}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <span className="mr-1"><EyeIcon size={16} /></span>
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-green-500 border-green-200">
                        <span className="mr-1"><PlusIcon size={16} /></span>
                        {/* Approve */}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-200">
                        <span className="mr-1"><CrossIcon size={16} /></span>
                        {/* Reject */}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'approved':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Approved Knowledge</CardTitle>
              <CardDescription>
                Manage knowledge that has been approved and added to the knowledge graph.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left font-medium">Title</th>
                      <th className="py-2 px-4 text-left font-medium">Date Added</th>
                      <th className="py-2 px-4 text-left font-medium">Type</th>
                      <th className="py-2 px-4 text-left font-medium">Usage</th>
                      <th className="py-2 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedKnowledge.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{item.title}</td>
                        <td className="py-2 px-4">{item.date}</td>
                        <td className="py-2 px-4">{item.type}</td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.usage === 'High' ? 'bg-green-100 text-green-800' : 
                            item.usage === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.usage}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" title="View">
                              <EyeIcon size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile view - Cards */}
              <div className="md:hidden space-y-4">
                {approvedKnowledge.map((item) => (
                  <div key={item.id} className="border rounded-md p-4 space-y-3 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.usage === 'High' ? 'bg-green-100 text-green-800' : 
                        item.usage === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.usage}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Date Added:</span>
                      <span>{item.date}</span>
                      <span className="text-muted-foreground">Type:</span>
                      <span>{item.type}</span>
                    </div>
                    <div className="flex justify-end pt-2 border-t">
                      <Button variant="outline" size="sm">
                        <span className="mr-1"><EyeIcon size={16} /></span>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Settings</CardTitle>
              <CardDescription>
                Configure how knowledge is processed, stored, and utilized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Knowledge Processing</h3>
                  <div className="grid md:grid-cols-2 gap-y-4 items-center">
                    <span className="text-sm md:text-base">Automatic approval for high-confidence items</span>
                    <Button variant="outline" className="justify-self-start md:justify-self-end">Disabled</Button>
                    <span className="text-sm md:text-base">AI-assisted knowledge extraction</span>
                    <Button variant="outline" className="justify-self-start md:justify-self-end">Enabled</Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Storage Settings</h3>
                  <div className="grid md:grid-cols-2 gap-y-4 items-center">
                    <span className="text-sm md:text-base">Knowledge retention period</span>
                    <span className="text-sm md:text-base md:text-right">Forever</span>
                    <span className="text-sm md:text-base">Duplicate detection</span>
                    <Button variant="outline" className="justify-self-start md:justify-self-end">Enabled</Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Access Control</h3>
                  <div className="grid md:grid-cols-2 gap-y-4 items-center">
                    <span className="text-sm md:text-base">Knowledge base access level</span>
                    <span className="text-sm md:text-base md:text-right">Admin Only</span>
                    <span className="text-sm md:text-base">Enable public knowledge sharing</span>
                    <Button variant="outline" className="justify-self-start md:justify-self-end">Disabled</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full md:w-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Knowledge Base">
          <Button>
            <PlusIcon size={16} />
            <span className="ml-2">Add Knowledge</span>
          </Button>
          <Button variant="outline">
            <FileIcon size={16} />
            <span className="ml-2">Export</span>
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>Knowledge awaiting review</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{pendingSessions.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Knowledge Items</CardTitle>
              <CardDescription>Approved items in database</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{approvedKnowledge.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Knowledge Usage</CardTitle>
              <CardDescription>Queries using knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">124</CardContent>
          </Card>
        </div>

        <div className="flex border-b mb-4">
          <button
            className={`pb-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-primary font-medium' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'approved' ? 'border-b-2 border-primary font-medium' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Knowledge
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-primary font-medium' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Knowledge Settings
          </button>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
} 