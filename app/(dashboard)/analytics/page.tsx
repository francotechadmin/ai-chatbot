'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileIcon, CodeIcon, MessageIcon, GlobeIcon } from '@/components/icons';
import { PageHeader } from '@/components/page-header';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics & Reports">
           <div className="flex gap-2">
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2">
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
            <Button variant="outline">
              <span className="mr-2"><FileIcon size={16} /></span>
              Export
            </Button>
          </div>
        </PageHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Queries</CardTitle>
              <CardDescription>Knowledge retrieval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,532</div>
              <p className="text-xs text-green-600 mt-1">+12.5% from previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Captures</CardTitle>
              <CardDescription>Knowledge added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">328</div>
              <p className="text-xs text-green-600 mt-1">+8.2% from previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Unique users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87</div>
              <p className="text-xs text-red-600 mt-1">-2.1% from previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Avg. Session</CardTitle>
              <CardDescription>Time per session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">6:23</div>
              <p className="text-xs text-green-600 mt-1">+1:12 from previous period</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Trends Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>System activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chart visualization would go here in a real implementation */}
            <div className="h-72 w-full bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-full h-48 px-8 relative">
                  {/* Mock line chart - would be replaced with actual chart library */}
                  <div className="absolute bottom-0 left-0 w-full h-px bg-border"></div>
                  <div className="absolute top-0 left-0 h-full w-px bg-border"></div>
                  
                  {/* Queries line */}
                  <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                    <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M0,80 L10,75 L20,85 L30,70 L40,60 L50,65 L60,50 L70,45 L80,30 L90,25 L100,20" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  
                  {/* Captures line */}
                  <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                    <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M0,90 L10,85 L20,88 L30,80 L40,82 L50,75 L60,78 L70,72 L80,68 L90,60 L100,55" 
                        fill="none" 
                        stroke="#16a34a" 
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Queries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Captures</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Knowledge Base Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Usage</CardTitle>
              <CardDescription>Most accessed knowledge categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Product Documentation</span>
                    <span className="text-sm text-muted-foreground">32%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Technical Specifications</span>
                    <span className="text-sm text-muted-foreground">28%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Procedures</span>
                    <span className="text-sm text-muted-foreground">18%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Company Policies</span>
                    <span className="text-sm text-muted-foreground">14%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Other</span>
                    <span className="text-sm text-muted-foreground">8%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Activity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>Type of system interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center">
                {/* Mock donut chart - would be replaced with actual chart library */}
                <div className="relative size-[180px]">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 50%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%, 50% 50%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-amber-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0, 50% 50%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-[24px] border-background" style={{ transform: 'scale(0.7)' }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Queries (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Captures (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Chat (25%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity By User and Top Searches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity by User</CardTitle>
              <CardDescription>Most active system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full size-8 bg-muted flex items-center justify-center">JS</div>
                    <div>
                      <div className="font-medium">Jane Smith</div>
                      <div className="text-xs text-muted-foreground">Admin</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><CodeIcon size={14} /></span>
                        <span>145</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><FileIcon size={14} /></span>
                        <span>89</span>
                      </div>
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full size-8 bg-muted flex items-center justify-center">JD</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-muted-foreground">Editor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><CodeIcon size={14} /></span>
                        <span>98</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><FileIcon size={14} /></span>
                        <span>121</span>
                      </div>
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full size-8 bg-muted flex items-center justify-center">RW</div>
                    <div>
                      <div className="font-medium">Robert Williams</div>
                      <div className="text-xs text-muted-foreground">Editor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><CodeIcon size={14} /></span>
                        <span>132</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><FileIcon size={14} /></span>
                        <span>67</span>
                      </div>
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '63%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full size-8 bg-muted flex items-center justify-center">AJ</div>
                    <div>
                      <div className="font-medium">Alice Johnson</div>
                      <div className="text-xs text-muted-foreground">Viewer</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><CodeIcon size={14} /></span>
                        <span>78</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-1"><FileIcon size={14} /></span>
                        <span>12</span>
                      </div>
                    </div>
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Searches</CardTitle>
              <CardDescription>Most frequent queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">1</div>
                  <div className="flex-1">Product specifications</div>
                  <div className="text-sm text-muted-foreground">122</div>
                </div>
                
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">2</div>
                  <div className="flex-1">Onboarding process</div>
                  <div className="text-sm text-muted-foreground">98</div>
                </div>
                
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">3</div>
                  <div className="flex-1">Annual review</div>
                  <div className="text-sm text-muted-foreground">83</div>
                </div>
                
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">4</div>
                  <div className="flex-1">API documentation</div>
                  <div className="text-sm text-muted-foreground">72</div>
                </div>
                
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">5</div>
                  <div className="flex-1">Competitive analysis</div>
                  <div className="text-sm text-muted-foreground">65</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">6</div>
                  <div className="flex-1">Security protocols</div>
                  <div className="text-sm text-muted-foreground">58</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 