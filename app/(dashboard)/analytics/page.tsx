import { PageHeader } from '@/components/page-header';
import type { TimeRange } from '@/lib/services/metrics-aggregation';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';

import { AnalyticsFilters } from './components/analytics-filters';
import { KeyMetrics } from './components/key-metrics';
import { UsageTrendsChart } from './components/usage-trends-chart';
import { KnowledgeBaseUsage } from './components/knowledge-base-usage';
import { ActivityDistribution } from './components/activity-distribution';
import { UserActivity } from './components/user-activity';
import { TopSearches } from './components/top-searches';
import { getAnalyticsData } from './server-actions';

interface AnalyticsPageProps {
  searchParams?: { 
    timeRange?: string;
  };
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  // Default to 30 days if no time range is provided
  const params = await searchParams;
  const timeRange = (params?.timeRange || '30d') as TimeRange;
  
  // Fetch data on the server
  const data = await getAnalyticsData(timeRange);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics & Reports">
          <AnalyticsFilters initialTimeRange={timeRange} />
        </PageHeader>

        {/* Key Metrics */}
        <KeyMetrics data={data.keyMetrics} />

        {/* Usage Trends Chart */}
        <UsageTrendsChart data={data.usageTrends} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Knowledge Base Usage */}
          <KnowledgeBaseUsage data={data.knowledgeBaseUsage} />

          {/* Activity Distribution */}
          <ActivityDistribution data={data.activityDistribution} />
        </div>

        {/* Activity By User and Top Searches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <UserActivity data={data.topUsers} />
          </div>
          <TopSearches data={data.topSearches} />
        </div>
      </div>
    </div>
  );
}