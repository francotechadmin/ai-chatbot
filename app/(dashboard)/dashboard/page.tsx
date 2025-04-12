'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  MessageIcon, 
  FileIcon, 
  GlobeIcon, 
  PlusIcon, 
  CodeIcon 
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';

// Mock data for demonstration
const recentActivity = [
  { id: '1', type: 'capture', title: 'Product Documentation', date: '2023-05-15', time: '10:30 AM' },
  { id: '2', type: 'query', title: 'Support Protocol Search', date: '2023-05-16', time: '2:45 PM' },
  { id: '3', type: 'approve', title: 'Technical Specifications', date: '2023-05-17', time: '9:15 AM' },
  { id: '4', type: 'chat', title: 'Meeting with Marketing', date: '2023-05-17', time: '11:30 AM' },
];

const quickActions = [
  { name: 'New Capture', icon: <FileIcon size={16} />, path: '/capture' },
  { name: 'New Query', icon: <CodeIcon size={16} />, path: '/query' },
  { name: 'View Knowledge Base', icon: <GlobeIcon size={16} />, path: '/knowledge-base' },
  { name: 'Start Chat', icon: <MessageIcon size={16} />, path: '/chat' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard">
          <Button variant="outline">
            <FileIcon size={16} />
            <span className="ml-2">Export Report</span>
          </Button>
          <Button>
            <PlusIcon size={16} />
            <span className="ml-2">New Session</span>
          </Button>
        </PageHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Captures</CardTitle>
              <CardDescription>Knowledge sessions created</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">45</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Queries</CardTitle>
              <CardDescription>Knowledge base searches</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">128</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Approved Items</CardTitle>
              <CardDescription>In knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">37</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">8</CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <Button key={index} variant="outline" className="justify-start h-auto py-3" asChild>
                    <a href={action.path} className="flex items-center">
                      <span className="mr-2">{action.icon}</span>
                      {action.name}
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent knowledge interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left font-medium">Type</th>
                      <th className="py-2 px-4 text-left font-medium">Title</th>
                      <th className="py-2 px-4 text-left font-medium">Date</th>
                      <th className="py-2 px-4 text-left font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">
                          <span className="flex items-center">
                            {activity.type === 'capture' && (
                              <>
                                <FileIcon size={16} />
                                <span className="ml-2 capitalize">capture</span>
                              </>
                            )}
                            {activity.type === 'query' && (
                              <>
                                <CodeIcon size={16} />
                                <span className="ml-2 capitalize">query</span>
                              </>
                            )}
                            {activity.type === 'approve' && (
                              <>
                                <PlusIcon size={16} />
                                <span className="ml-2 capitalize">approve</span>
                              </>
                            )}
                            {activity.type === 'chat' && (
                              <>
                                <MessageIcon size={16} />
                                <span className="ml-2 capitalize">chat</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-medium">{activity.title}</td>
                        <td className="py-2 px-4">{activity.date}</td>
                        <td className="py-2 px-4">{activity.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Knowledge Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Usage</CardTitle>
            <CardDescription>Most frequently accessed knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Product Documentation</span>
                  <span className="text-sm text-muted-foreground">78 queries</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Technical Specifications</span>
                  <span className="text-sm text-muted-foreground">63 queries</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '63%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Employee Handbook</span>
                  <span className="text-sm text-muted-foreground">45 queries</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Onboarding Process</span>
                  <span className="text-sm text-muted-foreground">32 queries</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 