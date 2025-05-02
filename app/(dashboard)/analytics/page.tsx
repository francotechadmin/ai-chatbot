'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileIcon, CodeIcon, } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeRange } from '@/lib/services/metrics-aggregation';

// Types for API response data
interface KeyMetrics {
  queries: { count: number; change: number };
  captures: { count: number; change: number };
  activeUsers: { count: number; change: number };
  avgSession: { 
    duration: number; 
    formattedDuration: string; 
    change: number;
    formattedChange: string;
  };
}

interface UsageTrend {
  date: string;
  queries: number;
  captures: number;
}

interface KnowledgeCategory {
  category: string;
  count: number;
  percentage: number;
}

interface ActivityDistribution {
  queries: { count: number; percentage: number };
  captures: { count: number; percentage: number };
  chat: { count: number; percentage: number };
}

interface UserActivity {
  userId: string;
  email: string;
  role: string;
  initials: string;
  queries: number;
  captures: number;
  activityPercentage: number;
}

interface TopSearch {
  rank: number;
  query: string;
  count: number;
}

interface AnalyticsData {
  keyMetrics?: KeyMetrics;
  usageTrends?: UsageTrend[];
  knowledgeBaseUsage?: KnowledgeCategory[];
  activityDistribution?: ActivityDistribution;
  topUsers?: UserActivity[];
  topSearches?: TopSearch[];
}

// Helper function to generate chart path for SVG line charts
function generateChartPath(data: UsageTrend[], key: 'queries' | 'captures'): string {
  if (!data || data.length === 0) return '';
  
  // Find the maximum value to normalize the data
  const maxValue = Math.max(...data.map(item => item[key]));
  
  // If all values are 0, return a flat line
  if (maxValue === 0) return 'M0,100 L100,100';
  
  // Generate the path
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    // Invert the y value (SVG y-axis is inverted)
    const y = 100 - ((item[key] / maxValue) * 100);
    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
  });
  
  return points.join(' ');
}

// Helper function to generate donut chart slice
function generateDonutSlice(startPercent: number, endPercent: number): string {
  // Convert percentages to angles
  const startAngle = (startPercent / 100) * 360;
  const endAngle = (endPercent / 100) * 360;
  
  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  
  // Calculate points on the circle
  const startX = 50 + 50 * Math.cos(startRad);
  const startY = 50 + 50 * Math.sin(startRad);
  const endX = 50 + 50 * Math.cos(endRad);
  const endY = 50 + 50 * Math.sin(endRad);
  
  // Determine which arc to use (large or small)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  // Create the SVG path for the slice
  if (endPercent - startPercent >= 100) {
    return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  }
  
  // Create a polygon path for CSS clip-path
  const points = [];
  points.push('50% 50%'); // Center point
  
  // Add the start point
  points.push(`${startX}% ${startY}%`);
  
  // Add points along the arc
  const steps = Math.max(2, Math.floor((endAngle - startAngle) / 10));
  for (let i = 1; i < steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const rad = (angle - 90) * (Math.PI / 180);
    const x = 50 + 50 * Math.cos(rad);
    const y = 50 + 50 * Math.sin(rad);
    points.push(`${x}% ${y}%`);
  }
  
  // Add the end point
  points.push(`${endX}% ${endY}%`);
  points.push('50% 50%'); // Back to center
  
  return `polygon(${points.join(', ')})`;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const analyticsData = await response.json();
        
        // Check if there are any errors in the response
        if (analyticsData.errors) {
          console.warn('Some metrics failed to load:', analyticsData.errors);
        }
        
        // Set the data even if there are some errors
        // The UI components will handle null/undefined values
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Set an empty data object to prevent the page from crashing
        setData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as TimeRange);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics & Reports">
           <div className="flex gap-2">
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="180d">Last 6 Months</option>
              <option value="365d">Last Year</option>
              <option value="all">All Time</option>
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
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {data.keyMetrics?.queries.count.toLocaleString() || 0}
                  </div>
                  <p className={`text-xs mt-1 ${data.keyMetrics?.queries.change && data.keyMetrics.queries.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.keyMetrics?.queries.change 
                      ? `${data.keyMetrics.queries.change >= 0 ? '+' : ''}${data.keyMetrics.queries.change.toFixed(1)}% from previous period` 
                      : 'No previous data'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Captures</CardTitle>
              <CardDescription>Knowledge added</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {data.keyMetrics?.captures.count.toLocaleString() || 0}
                  </div>
                  <p className={`text-xs mt-1 ${data.keyMetrics?.captures.change && data.keyMetrics.captures.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.keyMetrics?.captures.change 
                      ? `${data.keyMetrics.captures.change >= 0 ? '+' : ''}${data.keyMetrics.captures.change.toFixed(1)}% from previous period` 
                      : 'No previous data'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Unique users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {data.keyMetrics?.activeUsers.count.toLocaleString() || 0}
                  </div>
                  <p className={`text-xs mt-1 ${data.keyMetrics?.activeUsers.change && data.keyMetrics.activeUsers.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.keyMetrics?.activeUsers.change 
                      ? `${data.keyMetrics.activeUsers.change >= 0 ? '+' : ''}${data.keyMetrics.activeUsers.change.toFixed(1)}% from previous period` 
                      : 'No previous data'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Avg. Session</CardTitle>
              <CardDescription>Time per session</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {data.keyMetrics?.avgSession.formattedDuration || '0:00'}
                  </div>
                  <p className={`text-xs mt-1 ${data.keyMetrics?.avgSession.change && data.keyMetrics.avgSession.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.keyMetrics?.avgSession.change 
                      ? `${data.keyMetrics.avgSession.change >= 0 ? '+' : '-'}${data.keyMetrics.avgSession.formattedChange} from previous period` 
                      : 'No previous data'}
                  </p>
                </>
              )}
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
            {loading ? (
              <div className="h-72 w-full flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="h-72 w-full bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-full h-48 px-8 relative">
                    {/* Chart axes */}
                    <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
                    <div className="absolute top-0 left-0 h-full w-px bg-border" />
                    
                    {/* Queries line */}
                    {data.usageTrends && data.usageTrends.length > 0 && (
                      <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path 
                            d={generateChartPath(data.usageTrends, 'queries')}
                            fill="none" 
                            stroke="#2563eb" 
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Captures line */}
                    {data.usageTrends && data.usageTrends.length > 0 && (
                      <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path 
                            d={generateChartPath(data.usageTrends, 'captures')}
                            fill="none" 
                            stroke="#16a34a" 
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-blue-600 rounded-full" />
                      <span className="text-sm">Queries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-green-600 rounded-full" />
                      <span className="text-sm">Captures</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.knowledgeBaseUsage && data.knowledgeBaseUsage.length > 0 ? (
                    data.knowledgeBaseUsage.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${category.percentage}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No knowledge base usage data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Activity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>Type of system interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] w-full flex items-center justify-center">
                  <Skeleton className="h-[180px] w-[180px] rounded-full" />
                </div>
              ) : (
                <>
                  <div className="h-[250px] w-full flex items-center justify-center">
                    {data.activityDistribution ? (
                      <div className="relative size-[180px]">
                        {/* Queries slice */}
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-blue-500" 
                          style={{ 
                            clipPath: generateDonutSlice(0, data.activityDistribution.queries.percentage) 
                          }} 
                        />
                        {/* Captures slice */}
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-green-500" 
                          style={{ 
                            clipPath: generateDonutSlice(
                              data.activityDistribution.queries.percentage,
                              data.activityDistribution.queries.percentage + data.activityDistribution.captures.percentage
                            ) 
                          }} 
                        />
                        {/* Chat slice */}
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-amber-500" 
                          style={{ 
                            clipPath: generateDonutSlice(
                              data.activityDistribution.queries.percentage + data.activityDistribution.captures.percentage,
                              100
                            ) 
                          }} 
                        />
                        {/* Inner circle */}
                        <div className="absolute inset-0 rounded-full border-[24px] border-background" style={{ transform: 'scale(0.7)' }} />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No activity distribution data available
                      </div>
                    )}
                  </div>
                  
                  {data.activityDistribution && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="size-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Queries ({data.activityDistribution.queries.percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Captures ({data.activityDistribution.captures.percentage}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-3 bg-amber-500 rounded-full" />
                        <span className="text-sm">Chat ({data.activityDistribution.chat.percentage}%)</span>
                      </div>
                    </div>
                  )}
                </>
              )}
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
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-2 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topUsers && data.topUsers.length > 0 ? (
                    data.topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full size-8 bg-muted flex items-center justify-center">{user.initials}</div>
                          <div>
                            <div className="font-medium">{user.email.split('@')[0]}</div>
                            <div className="text-xs text-muted-foreground">{user.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <div className="flex items-center text-sm">
                              <span className="mr-1"><CodeIcon size={14} /></span>
                              <span>{user.queries}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="mr-1"><FileIcon size={14} /></span>
                              <span>{user.captures}</span>
                            </div>
                          </div>
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${user.activityPercentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No user activity data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Searches</CardTitle>
              <CardDescription>Most frequent queries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 pb-2 border-b">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topSearches && data.topSearches.length > 0 ? (
                    data.topSearches.map((search, index) => (
                      <div key={index} className="flex items-center gap-2 pb-2 border-b">
                        <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">{search.rank}</div>
                        <div className="flex-1">{search.query}</div>
                        <div className="text-sm text-muted-foreground">{search.count}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No search data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}