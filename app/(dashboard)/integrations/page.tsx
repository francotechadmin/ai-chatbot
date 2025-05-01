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
import { PlusIcon, } from '@/components/icons';
import { PageHeader } from '@/components/page-header';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  route?: string; // Optional route for direct linking
  status: 'connected' | 'available' | 'coming_soon';
  category: 'communication' | 'document' | 'project' | 'knowledge' | 'crm';
}

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Mock data for available integrations
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Slack',
      description: 'Connect to Slack channels to capture and query knowledge.',
      icon: 'S',
      status: 'connected',
      category: 'communication'
    },
    {
      id: '2',
      name: 'Google Workspace',
      description: 'Import documents from Google Drive, Docs, and Sheets.',
      icon: 'G',
      status: 'available',
      category: 'document'
    },
    {
      id: '3',
      name: 'Microsoft Teams',
      description: 'Integrate with Teams for knowledge sharing and capture.',
      icon: 'M',
      status: 'available',
      category: 'communication'
    },
    {
      id: '4',
      name: 'Notion',
      description: 'Import Notion pages into your knowledge base.',
      icon: 'N',
      status: 'connected',
      category: 'knowledge'
    },
    {
      id: '5',
      name: 'Jira',
      description: 'Connect project information and documentation.',
      icon: 'J',
      status: 'coming_soon',
      category: 'project'
    },
    {
      id: '6',
      name: 'Salesforce',
      description: 'Integrate customer information with your knowledge base.',
      icon: 'SF',
      status: 'coming_soon',
      category: 'crm'
    },
    {
      id: '7',
      name: 'SharePoint',
      description: 'Import documents and knowledge from SharePoint.',
      icon: 'SP',
      status: 'available',
      category: 'document'
    },
    {
      id: '8',
      name: 'Microsoft',
      route: '/integrations/microsoft',
      description: 'Connect Microsoft 365 services for knowledge capture.',
      icon: 'MS',
      status: 'available',
      category: 'document',
    },
    {
      id: '9',
      name: 'Confluence',
      description: 'Connect and import Confluence pages and spaces.',
      icon: 'C',
      status: 'available',
      category: 'knowledge'
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter ? integration.category === activeFilter : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Integrations">
          <Button>
            <PlusIcon size={16} />
            <span className="ml-2">New Integration</span>
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Connected</CardTitle>
              <CardDescription>Active integrations</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {integrations.filter(i => i.status === 'connected').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Available</CardTitle>
              <CardDescription>Ready to connect</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {integrations.filter(i => i.status === 'available').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>In development</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {integrations.filter(i => i.status === 'coming_soon').length}
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input 
                  placeholder="Search integrations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activeFilter === null ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                >
                  All
                </Button>
                <Button 
                  variant={activeFilter === 'communication' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('communication')}
                >
                  Communication
                </Button>
                <Button 
                  variant={activeFilter === 'document' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('document')}
                >
                  Documents
                </Button>
                <Button 
                  variant={activeFilter === 'knowledge' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setActiveFilter('knowledge')}
                >
                  Knowledge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center font-medium text-primary">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                  </div>
                  <div>
                    {integration.status === 'connected' && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    )}
                    {integration.status === 'coming_soon' && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="capitalize">{integration.category}</span>
                </div>
              </CardContent>
              <CardFooter>
                {integration.status === 'connected' ? (
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1">Configure</Button>
                    <Button variant="outline" className="flex-1 text-red-500">Disconnect</Button>
                  </div>
                ) : integration.status === 'available' ? (
                  <Button className="w-full" onClick={() => window.location.href = integration.route || `/integrations/${integration.id}/connect`}>
                    Connect Now
                  </Button>
                ) : (
                  // For 'coming_soon' status, we disable the button
                  <Button disabled className="w-full">Coming Soon</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Integration Activity</CardTitle>
            <CardDescription>Latest events and data transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="size-w-8 rounded-lg bg-muted flex items-center justify-center">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Slack</div>
                    <span className="text-xs text-muted-foreground">Today, 10:30 AM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    15 messages imported from #project-alpha channel
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                  N
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Notion</div>
                    <span className="text-xs text-muted-foreground">Yesterday, 2:45 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Updated &quot;Product Documentation&quot; page imported automatically
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                  G
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Google Workspace</div>
                    <span className="text-xs text-muted-foreground">Jun 15, 2023</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connected Google Drive as a knowledge source
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 