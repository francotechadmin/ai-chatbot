import { db } from '@/lib/db';
import { 
  queryMetric,
  knowledgeBaseMetric,
  userActivityMetric,
  userSession,
  user
} from '@/lib/db/schema';
import { and, eq, gte, lte, count, avg, desc, sql } from 'drizzle-orm';

/**
 * Metrics Aggregation Service
 * 
 * This service provides functions to aggregate raw metrics data for different time periods
 * and calculate period-over-period changes for trend indicators.
 */

export type TimeRange = '7d' | '30d' | '90d' | '180d' | '365d' | 'all';

/**
 * Get the date range for a given time period
 * 
 * @param timeRange Time range identifier
 * @returns Object with start and end dates
 */
export function getDateRangeFromTimeRange(timeRange: TimeRange): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '180d':
      startDate.setDate(endDate.getDate() - 180);
      break;
    case '365d':
      startDate.setDate(endDate.getDate() - 365);
      break;
    case 'all':
      // Set to a date far in the past to get all data
      startDate.setFullYear(2000);
      break;
  }
  
  return { startDate, endDate };
}

/**
 * Get the previous date range for period-over-period comparison
 * 
 * @param timeRange Current time range
 * @returns Object with previous period start and end dates
 */
export function getPreviousPeriodDateRange(timeRange: TimeRange): { startDate: Date, endDate: Date } {
  const { startDate: currentStartDate, endDate: currentEndDate } = getDateRangeFromTimeRange(timeRange);
  
  // Calculate the duration of the current period in milliseconds
  const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();
  
  // Set the end date of the previous period to the start date of the current period
  const endDate = new Date(currentStartDate);
  // Set the start date of the previous period
  const startDate = new Date(endDate.getTime() - periodDuration);
  
  return { startDate, endDate };
}

/**
 * Calculate the percentage change between current and previous values
 * 
 * @param current Current period value
 * @param previous Previous period value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // If previous was 0, and current is positive, it's a 100% increase
  }
  
  return ((current - previous) / previous) * 100;
}

/**
 * Format time difference for display
 * 
 * @param seconds Time difference in seconds
 * @returns Formatted time string (e.g., "5:23")
 */
export function formatTimeDifference(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get key metrics for the analytics dashboard
 * 
 * @param timeRange Time range to get metrics for
 * @returns Object with key metrics and their period-over-period changes
 */
export async function getKeyMetrics(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodDateRange(timeRange);
  
  // Get total queries count
  const [queriesResult] = await db
    .select({ count: count() })
    .from(queryMetric)
    .where(and(
      gte(queryMetric.timestamp, startDate),
      lte(queryMetric.timestamp, endDate)
    ));
  
  const [prevQueriesResult] = await db
    .select({ count: count() })
    .from(queryMetric)
    .where(and(
      gte(queryMetric.timestamp, prevStartDate),
      lte(queryMetric.timestamp, prevEndDate)
    ));
  
  // Get captures count (knowledge base uploads)
  const [capturesResult] = await db
    .select({ count: count() })
    .from(knowledgeBaseMetric)
    .where(and(
      eq(knowledgeBaseMetric.operation, 'upload'),
      gte(knowledgeBaseMetric.timestamp, startDate),
      lte(knowledgeBaseMetric.timestamp, endDate)
    ));
  
  const [prevCapturesResult] = await db
    .select({ count: count() })
    .from(knowledgeBaseMetric)
    .where(and(
      eq(knowledgeBaseMetric.operation, 'upload'),
      gte(knowledgeBaseMetric.timestamp, prevStartDate),
      lte(knowledgeBaseMetric.timestamp, prevEndDate)
    ));
  
  // Get active users count
  const [activeUsersResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${userActivityMetric.userId})` })
    .from(userActivityMetric)
    .innerJoin(user, eq(userActivityMetric.userId, user.id))
    .where(and(
      gte(userActivityMetric.timestamp, startDate),
      lte(userActivityMetric.timestamp, endDate)
    ));
  
  const [prevActiveUsersResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${userActivityMetric.userId})` })
    .from(userActivityMetric)
    .innerJoin(user, eq(userActivityMetric.userId, user.id))
    .where(and(
      gte(userActivityMetric.timestamp, prevStartDate),
      lte(userActivityMetric.timestamp, prevEndDate)
    ));
  
  // Get average session duration
  const [avgSessionResult] = await db
    .select({ avg: avg(userSession.duration) })
    .from(userSession)
    .where(and(
      eq(userSession.status, 'completed'),
      gte(userSession.startTime, startDate),
      lte(userSession.endTime, endDate)
    ));
  
  const [prevAvgSessionResult] = await db
    .select({ avg: avg(userSession.duration) })
    .from(userSession)
    .where(and(
      eq(userSession.status, 'completed'),
      gte(userSession.startTime, prevStartDate),
      lte(userSession.endTime, prevEndDate)
    ));
  
  // Calculate percentage changes
  const queriesCount = queriesResult?.count || 0;
  const prevQueriesCount = prevQueriesResult?.count || 0;
  const queriesChange = calculatePercentageChange(queriesCount, prevQueriesCount);
  
  const capturesCount = capturesResult?.count || 0;
  const prevCapturesCount = prevCapturesResult?.count || 0;
  const capturesChange = calculatePercentageChange(capturesCount, prevCapturesCount);
  
  const activeUsersCount = activeUsersResult?.count || 0;
  const prevActiveUsersCount = prevActiveUsersResult?.count || 0;
  const activeUsersChange = calculatePercentageChange(activeUsersCount, prevActiveUsersCount);
  
  // Convert to numbers and ensure we have valid values
  const avgSessionDuration = Number(avgSessionResult?.avg || 0);
  const prevAvgSessionDuration = Number(prevAvgSessionResult?.avg || 0);
  const avgSessionChange = avgSessionDuration - prevAvgSessionDuration;
  
  return {
    queries: {
      count: queriesCount,
      change: queriesChange,
    },
    captures: {
      count: capturesCount,
      change: capturesChange,
    },
    activeUsers: {
      count: activeUsersCount,
      change: activeUsersChange,
    },
    avgSession: {
      duration: avgSessionDuration,
      formattedDuration: formatTimeDifference(Number(avgSessionDuration)),
      change: avgSessionChange,
      formattedChange: formatTimeDifference(Math.abs(avgSessionChange)),
    },
  };
}

/**
 * Get usage trends data for the specified time range
 * 
 * @param timeRange Time range to get trends for
 * @returns Array of data points for the trend chart
 */
export async function getUsageTrends(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  
  // Determine the appropriate interval based on the time range
  let interval: 'day' | 'week' | 'month';
  if (['7d', '30d'].includes(timeRange)) {
    interval = 'day';
  } else if (['90d', '180d'].includes(timeRange)) {
    interval = 'week';
  } else {
    interval = 'month';
  }
  
  // SQL to truncate timestamp to the appropriate interval
  let truncateExpr: ReturnType<typeof sql>;
  if (interval === 'day') {
    truncateExpr = sql`DATE_TRUNC('day', "timestamp")`;
  } else if (interval === 'week') {
    truncateExpr = sql`DATE_TRUNC('week', "timestamp")`;
  } else {
    truncateExpr = sql`DATE_TRUNC('month', "timestamp")`;
  }
  
  // Get query trends
  const queryTrends = await db
    .select({
      date: truncateExpr,
      count: count(),
    })
    .from(queryMetric)
    .where(and(
      gte(queryMetric.timestamp, startDate),
      lte(queryMetric.timestamp, endDate)
    ))
    .groupBy(truncateExpr)
    .orderBy(truncateExpr);
  
  // Get capture trends
  const captureTrends = await db
    .select({
      date: truncateExpr,
      count: count(),
    })
    .from(knowledgeBaseMetric)
    .where(and(
      eq(knowledgeBaseMetric.operation, 'upload'),
      gte(knowledgeBaseMetric.timestamp, startDate),
      lte(knowledgeBaseMetric.timestamp, endDate)
    ))
    .groupBy(truncateExpr)
    .orderBy(truncateExpr);
  
  // Combine the data into a single array with dates as keys
  const trendsMap = new Map();
  
  // Initialize with all dates in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    let dateKey: string;
    if (interval === 'day') {
      dateKey = currentDate.toISOString().split('T')[0];
    } else if (interval === 'week') {
      // Get the start of the week (Sunday)
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day;
      const weekStart = new Date(currentDate);
      weekStart.setDate(diff);
      dateKey = weekStart.toISOString().split('T')[0];
    } else {
      dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    }
    
    trendsMap.set(dateKey, {
      date: dateKey,
      queries: 0,
      captures: 0,
    });
    
    // Move to next interval
    if (interval === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (interval === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  // Add query data
  for (const item of queryTrends) {
    const dateKey = new Date(item.date as Date).toISOString().split('T')[0];
    if (trendsMap.has(dateKey)) {
      trendsMap.get(dateKey).queries = Number(item.count);
    }
  }
  
  // Add capture data
  for (const item of captureTrends) {
    const dateKey = new Date(item.date as Date).toISOString().split('T')[0];
    if (trendsMap.has(dateKey)) {
      trendsMap.get(dateKey).captures = Number(item.count);
    }
  }
  
  // Convert map to array and sort by date
  return Array.from(trendsMap.values()).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

/**
 * Get knowledge base usage statistics
 * 
 * @param timeRange Time range to get statistics for
 * @returns Array of knowledge categories with usage percentages
 */
export async function getKnowledgeBaseUsage(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  
  // Get knowledge source access counts grouped by category
  // We'll use the metadata.category field from knowledgeBaseMetric
  const kbUsage = await db
    .select({
      category: sql`metadata->>'category'`,
      count: count(),
    })
    .from(knowledgeBaseMetric)
    .where(and(
      gte(knowledgeBaseMetric.timestamp, startDate),
      lte(knowledgeBaseMetric.timestamp, endDate),
      sql`metadata->>'category' IS NOT NULL`
    ))
    .groupBy(sql`metadata->>'category'`)
    .orderBy(desc(count()));
  
  // Calculate total count
  const totalCount = kbUsage.reduce((sum, item) => sum + Number(item.count), 0);
  
  // Calculate percentages
  const result = kbUsage.map(item => ({
    category: item.category || 'Uncategorized',
    count: Number(item.count),
    percentage: totalCount > 0 ? Math.round((Number(item.count) / totalCount) * 100) : 0,
  }));
  
  // If we have fewer than 5 categories, add "Other" for the rest
  if (result.length > 5) {
    const topCategories = result.slice(0, 4);
    const otherCategories = result.slice(4);
    const otherCount = otherCategories.reduce((sum, item) => sum + item.count, 0);
    const otherPercentage = totalCount > 0 ? Math.round((otherCount / totalCount) * 100) : 0;
    
    return [
      ...topCategories,
      {
        category: 'Other',
        count: otherCount,
        percentage: otherPercentage,
      },
    ];
  }
  
  return result;
}

/**
 * Get activity distribution by type
 * 
 * @param timeRange Time range to get distribution for
 * @returns Object with activity type percentages
 */
export async function getActivityDistribution(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  
  // Count events by category
  const [queriesCount] = await db
    .select({ count: count() })
    .from(queryMetric)
    .where(and(
      gte(queryMetric.timestamp, startDate),
      lte(queryMetric.timestamp, endDate)
    ));
  
  const [capturesCount] = await db
    .select({ count: count() })
    .from(knowledgeBaseMetric)
    .where(and(
      eq(knowledgeBaseMetric.operation, 'upload'),
      gte(knowledgeBaseMetric.timestamp, startDate),
      lte(knowledgeBaseMetric.timestamp, endDate)
    ));
  
  const [chatCount] = await db
    .select({ count: count() })
    .from(userActivityMetric)
    .where(and(
      eq(userActivityMetric.activityType, 'chat'),
      gte(userActivityMetric.timestamp, startDate),
      lte(userActivityMetric.timestamp, endDate)
    ));
  
  // Calculate total and percentages
  const queries = Number(queriesCount?.count || 0);
  const captures = Number(capturesCount?.count || 0);
  const chat = Number(chatCount?.count || 0);
  const total = queries + captures + chat;
  
  return {
    queries: {
      count: queries,
      percentage: total > 0 ? Math.round((queries / total) * 100) : 0,
    },
    captures: {
      count: captures,
      percentage: total > 0 ? Math.round((captures / total) * 100) : 0,
    },
    chat: {
      count: chat,
      percentage: total > 0 ? Math.round((chat / total) * 100) : 0,
    },
  };
}

/**
 * Get top active users with their activity metrics
 * 
 * @param timeRange Time range to get user activity for
 * @param limit Maximum number of users to return
 * @returns Array of users with their activity metrics
 */
export async function getTopActiveUsers(timeRange: TimeRange, limit = 4) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  
  // Get users with the most activity
  const userActivity = await db
    .select({
      userId: userActivityMetric.userId,
      email: user.email,
      role: user.role,
      activityCount: count(),
    })
    .from(userActivityMetric)
    .innerJoin(user, eq(userActivityMetric.userId, user.id))
    .where(and(
      gte(userActivityMetric.timestamp, startDate),
      lte(userActivityMetric.timestamp, endDate)
    ))
    .groupBy(userActivityMetric.userId, user.email, user.role)
    .orderBy(desc(count()))
    .limit(limit);
  
  // For each user, get their query and capture counts
  const result = await Promise.all(userActivity.map(async (userData) => {
    // Get query count
    const [queriesResult] = await db
      .select({ count: count() })
      .from(queryMetric)
      .where(and(
        eq(queryMetric.userId, userData.userId),
        gte(queryMetric.timestamp, startDate),
        lte(queryMetric.timestamp, endDate)
      ));
    
    // Get captures count
    const [capturesResult] = await db
      .select({ count: count() })
      .from(knowledgeBaseMetric)
      .where(and(
        eq(knowledgeBaseMetric.userId, userData.userId),
        eq(knowledgeBaseMetric.operation, 'upload'),
        gte(knowledgeBaseMetric.timestamp, startDate),
        lte(knowledgeBaseMetric.timestamp, endDate)
      ));
    
    // Calculate activity percentage relative to the most active user
    const maxActivity = userActivity[0].activityCount;
    const activityPercentage = Math.round((Number(userData.activityCount) / Number(maxActivity)) * 100);
    
    return {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      initials: userData.email
        .split('@')[0]
        .split('.')
        .map(part => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2),
      queries: Number(queriesResult?.count || 0),
      captures: Number(capturesResult?.count || 0),
      activityPercentage,
    };
  }));
  
  return result;
}

/**
 * Get top search queries
 * 
 * @param timeRange Time range to get top searches for
 * @param limit Maximum number of searches to return
 * @returns Array of top search queries with counts
 */
export async function getTopSearches(timeRange: TimeRange, limit = 6) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
  
  // Get the most frequent search queries
  const topSearches = await db
    .select({
      queryText: queryMetric.queryText,
      count: count(),
    })
    .from(queryMetric)
    .where(and(
      gte(queryMetric.timestamp, startDate),
      lte(queryMetric.timestamp, endDate),
      sql`"queryText" IS NOT NULL`
    ))
    .groupBy(queryMetric.queryText)
    .orderBy(desc(count()))
    .limit(limit);
  
  return topSearches.map((search, index) => ({
    rank: index + 1,
    query: search.queryText || '',
    count: Number(search.count),
  }));
}