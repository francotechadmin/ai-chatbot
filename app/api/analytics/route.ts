import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { 
  getKeyMetrics, 
  getUsageTrends, 
  getKnowledgeBaseUsage, 
  getActivityDistribution, 
  getTopActiveUsers, 
  getTopSearches,
  TimeRange
} from '@/lib/services/metrics-aggregation';

/**
 * GET /api/analytics
 * 
 * Returns aggregated metrics data for the analytics dashboard
 * Supports query parameters for time period filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const timeRange = (searchParams.get('timeRange') || '30d') as TimeRange;
    const metricType = searchParams.get('metricType') || 'all';

    // Validate time range
    const validTimeRanges: TimeRange[] = ['7d', '30d', '90d', '180d', '365d', 'all'];
    if (!validTimeRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid time range parameter' },
        { status: 400 }
      );
    }

    // Fetch requested metrics based on metricType
    let responseData: any = {};

    // Use try/catch for each metric to prevent one failure from breaking the entire response
    if (metricType === 'all' || metricType === 'key') {
      try {
        responseData.keyMetrics = await getKeyMetrics(timeRange);
      } catch (error) {
        console.error('Error fetching key metrics:', error);
        responseData.keyMetrics = null;
        responseData.errors = responseData.errors || {};
        responseData.errors.keyMetrics = 'Failed to fetch key metrics';
      }
    }

    if (metricType === 'all' || metricType === 'trends') {
      try {
        responseData.usageTrends = await getUsageTrends(timeRange);
      } catch (error) {
        console.error('Error fetching usage trends:', error);
        responseData.usageTrends = [];
        responseData.errors = responseData.errors || {};
        responseData.errors.usageTrends = 'Failed to fetch usage trends';
      }
    }

    if (metricType === 'all' || metricType === 'kb') {
      try {
        responseData.knowledgeBaseUsage = await getKnowledgeBaseUsage(timeRange);
      } catch (error) {
        console.error('Error fetching knowledge base usage:', error);
        responseData.knowledgeBaseUsage = [];
        responseData.errors = responseData.errors || {};
        responseData.errors.knowledgeBaseUsage = 'Failed to fetch knowledge base usage';
      }
    }

    if (metricType === 'all' || metricType === 'activity') {
      try {
        responseData.activityDistribution = await getActivityDistribution(timeRange);
      } catch (error) {
        console.error('Error fetching activity distribution:', error);
        responseData.activityDistribution = null;
        responseData.errors = responseData.errors || {};
        responseData.errors.activityDistribution = 'Failed to fetch activity distribution';
      }
    }

    if (metricType === 'all' || metricType === 'users') {
      try {
        responseData.topUsers = await getTopActiveUsers(timeRange);
      } catch (error) {
        console.error('Error fetching top users:', error);
        responseData.topUsers = [];
        responseData.errors = responseData.errors || {};
        responseData.errors.topUsers = 'Failed to fetch top users';
      }
    }

    if (metricType === 'all' || metricType === 'searches') {
      try {
        responseData.topSearches = await getTopSearches(timeRange);
      } catch (error) {
        console.error('Error fetching top searches:', error);
        responseData.topSearches = [];
        responseData.errors = responseData.errors || {};
        responseData.errors.topSearches = 'Failed to fetch top searches';
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}