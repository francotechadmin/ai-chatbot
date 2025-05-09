// Types for API response data
export interface KeyMetrics {
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

export interface UsageTrend {
  date: string;
  queries: number;
  captures: number;
}

export interface KnowledgeCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ActivityDistribution {
  queries: { count: number; percentage: number };
  captures: { count: number; percentage: number };
  chat: { count: number; percentage: number };
}

export interface UserActivity {
  userId: string;
  email: string;
  role: string;
  initials: string;
  queries: number;
  captures: number;
  activityPercentage: number;
}

export interface TopSearch {
  rank: number;
  query: string;
  count: number;
}

export interface AnalyticsData {
  keyMetrics?: KeyMetrics;
  usageTrends?: UsageTrend[];
  knowledgeBaseUsage?: KnowledgeCategory[];
  activityDistribution?: ActivityDistribution;
  topUsers?: UserActivity[];
  topSearches?: TopSearch[];
}