'use server';

import { auth } from '@/app/(auth)/auth';
import { 
  getKeyMetrics, 
  getUsageTrends, 
  getKnowledgeBaseUsage, 
  getActivityDistribution, 
  getTopActiveUsers, 
  getTopSearches,
  type TimeRange
} from '@/lib/services/metrics-aggregation';
import type { AnalyticsData } from './types';

/**
 * Fetches analytics data for the specified time range
 */
export async function getAnalyticsData(timeRange: TimeRange = '30d'): Promise<AnalyticsData> {
  // Check authentication
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error('Authentication required');
  }

  // Initialize response data
  const responseData: AnalyticsData = {};
  
  // Use try/catch for each metric to prevent one failure from breaking the entire response
  try {
    responseData.keyMetrics = await getKeyMetrics(timeRange);
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    responseData.errors = responseData.errors || {};
    responseData.errors.keyMetrics = 'Failed to fetch key metrics';
  }

  try {
    responseData.usageTrends = await getUsageTrends(timeRange);
  } catch (error) {
    console.error('Error fetching usage trends:', error);
    responseData.usageTrends = [];
    responseData.errors = responseData.errors || {};
    responseData.errors.usageTrends = 'Failed to fetch usage trends';
  }

  try {
    responseData.knowledgeBaseUsage = await getKnowledgeBaseUsage(timeRange);
  } catch (error) {
    console.error('Error fetching knowledge base usage:', error);
    responseData.knowledgeBaseUsage = [];
    responseData.errors = responseData.errors || {};
    responseData.errors.knowledgeBaseUsage = 'Failed to fetch knowledge base usage';
  }

  try {
    responseData.activityDistribution = await getActivityDistribution(timeRange);
  } catch (error) {
    console.error('Error fetching activity distribution:', error);
    responseData.activityDistribution = null;
    responseData.errors = responseData.errors || {};
    responseData.errors.activityDistribution = 'Failed to fetch activity distribution';
  }

  try {
    responseData.topUsers = await getTopActiveUsers(timeRange);
  } catch (error) {
    console.error('Error fetching top users:', error);
    responseData.topUsers = [];
    responseData.errors = responseData.errors || {};
    responseData.errors.topUsers = 'Failed to fetch top users';
  }

  try {
    responseData.topSearches = await getTopSearches(timeRange);
  } catch (error) {
    console.error('Error fetching top searches:', error);
    responseData.topSearches = [];
    responseData.errors = responseData.errors || {};
    responseData.errors.topSearches = 'Failed to fetch top searches';
  }

  return responseData;
}