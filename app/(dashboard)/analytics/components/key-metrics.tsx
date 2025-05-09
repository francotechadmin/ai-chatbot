'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { KeyMetrics as KeyMetricsType } from '../types';

interface KeyMetricsProps {
  data?: KeyMetricsType;
}

export function KeyMetrics({ data }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Queries</CardTitle>
          <CardDescription>Knowledge retrieval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data?.queries.count.toLocaleString() || 0}
          </div>
          <p className={`text-xs mt-1 ${data?.queries.change && data.queries.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.queries.change 
              ? `${data.queries.change >= 0 ? '+' : ''}${data.queries.change.toFixed(1)}% from previous period` 
              : 'No previous data'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Captures</CardTitle>
          <CardDescription>Knowledge added</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data?.captures.count.toLocaleString() || 0}
          </div>
          <p className={`text-xs mt-1 ${data?.captures.change && data.captures.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.captures.change 
              ? `${data.captures.change >= 0 ? '+' : ''}${data.captures.change.toFixed(1)}% from previous period` 
              : 'No previous data'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Active Users</CardTitle>
          <CardDescription>Unique users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data?.activeUsers.count.toLocaleString() || 0}
          </div>
          <p className={`text-xs mt-1 ${data?.activeUsers.change && data.activeUsers.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.activeUsers.change 
              ? `${data.activeUsers.change >= 0 ? '+' : ''}${data.activeUsers.change.toFixed(1)}% from previous period` 
              : 'No previous data'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Avg. Session</CardTitle>
          <CardDescription>Time per session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data?.avgSession.formattedDuration || '0:00'}
          </div>
          <p className={`text-xs mt-1 ${data?.avgSession.change && data.avgSession.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.avgSession.change 
              ? `${data.avgSession.change >= 0 ? '+' : '-'}${data.avgSession.formattedChange} from previous period` 
              : 'No previous data'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}