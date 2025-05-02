import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import {
  metricEvent,
  queryMetric,
  knowledgeBaseMetric,
  userSession,
  userActivityMetric,
  systemPerformanceMetric,
} from '@/lib/db/schema';

/**
 * Metrics Service
 * 
 * This service provides functions for recording various types of metrics
 * throughout the application. All functions are designed to be non-blocking
 * and include error handling to prevent metrics collection failures from
 * affecting core functionality.
 */

/**
 * Record a generic metric event
 * 
 * @param data Metric event data
 * @returns Promise that resolves when the metric is recorded
 */
export async function recordMetricEvent({
  userId,
  eventType,
  category,
  action,
  metadata,
}: {
  userId?: string;
  eventType: string;
  category: string;
  action: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Use Promise.resolve().then to make this non-blocking
    return Promise.resolve().then(async () => {
      await db.insert(metricEvent).values({
        userId,
        eventType,
        category,
        action,
        metadata,
        timestamp: new Date(),
      });
      
      console.log(`Metric recorded: ${category} - ${action}`);
    }).catch(error => {
      console.error('Error recording metric event:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing metric event:', error);
  }
}

/**
 * Record a query-related metric
 * 
 * @param data Query metric data
 * @returns Promise that resolves when the metric is recorded
 */
export async function recordQueryMetric({
  chatId,
  userId,
  messageId,
  queryText,
  responseTime,
  tokenCount,
  promptTokens,
  completionTokens,
  modelUsed,
  knowledgeBaseUsed = false,
  knowledgeSourceIds,
  metadata,
}: {
  chatId?: string;
  userId?: string;
  messageId?: string;
  queryText?: string;
  responseTime: number;
  tokenCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  modelUsed?: string;
  knowledgeBaseUsed?: boolean;
  knowledgeSourceIds?: string[];
  metadata?: Record<string, any>;
}) {
  try {
    // Use Promise.resolve().then to make this non-blocking
    return Promise.resolve().then(async () => {
      // Record the specific query metric
      await db.insert(queryMetric).values({
        chatId,
        userId,
        messageId,
        queryText,
        responseTime,
        tokenCount,
        promptTokens,
        completionTokens,
        modelUsed,
        knowledgeBaseUsed,
        knowledgeSourceIds: knowledgeSourceIds ? knowledgeSourceIds : undefined,
        timestamp: new Date(),
        metadata,
      });
      
      // Also record a general metric event
      await recordMetricEvent({
        userId,
        eventType: 'query',
        category: 'chat',
        action: 'query_processed',
        metadata: {
          chatId,
          responseTime,
          modelUsed,
          knowledgeBaseUsed,
        },
      });
      
      console.log(`Query metric recorded: ${responseTime}ms, KB used: ${knowledgeBaseUsed}`);
    }).catch(error => {
      console.error('Error recording query metric:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing query metric:', error);
  }
}

/**
 * Record a knowledge base operation metric
 * 
 * @param data Knowledge base metric data
 * @returns Promise that resolves when the metric is recorded
 */
export async function recordKnowledgeBaseMetric({
  userId,
  operation,
  knowledgeSourceId,
  responseTime,
  resultCount,
  queryText,
  metadata,
}: {
  userId?: string;
  operation: 'upload' | 'search' | 'retrieve' | 'update' | 'delete';
  knowledgeSourceId?: string;
  responseTime?: number;
  resultCount?: number;
  queryText?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Use Promise.resolve().then to make this non-blocking
    return Promise.resolve().then(async () => {
      // Record the specific knowledge base metric
      await db.insert(knowledgeBaseMetric).values({
        userId,
        operation,
        knowledgeSourceId,
        responseTime,
        resultCount,
        queryText,
        timestamp: new Date(),
        metadata,
      });
      
      // Also record a general metric event
      await recordMetricEvent({
        userId,
        eventType: 'knowledge_base',
        category: 'knowledge',
        action: `kb_${operation}`,
        metadata: {
          knowledgeSourceId,
          responseTime,
          resultCount,
        },
      });
      
      console.log(`Knowledge base metric recorded: ${operation}`);
    }).catch(error => {
      console.error('Error recording knowledge base metric:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing knowledge base metric:', error);
  }
}

/**
 * Record a user session metric
 * 
 * @param data User session data
 * @returns Promise that resolves when the metric is recorded and the session ID
 */
export async function recordUserSessionMetric({
  userId,
  startTime = new Date(),
  deviceInfo,
  ipAddress,
  userAgent,
  status = 'active',
  metadata,
}: {
  userId: string;
  startTime?: Date;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'active' | 'completed' | 'terminated';
  metadata?: Record<string, any>;
}): Promise<string | undefined> {
  try {
    // This function returns the session ID so it can be used to update the session later
    return Promise.resolve().then(async () => {
      const [result] = await db.insert(userSession).values({
        userId,
        startTime,
        status,
        deviceInfo,
        ipAddress,
        userAgent,
        metadata,
      }).returning({ id: userSession.id });
      
      // Also record a general metric event
      await recordMetricEvent({
        userId,
        eventType: 'session',
        category: 'user',
        action: 'session_start',
        metadata: {
          sessionId: result?.id,
          deviceInfo,
          ipAddress,
        },
      });
      
      console.log(`User session started: ${result?.id}`);
      return result?.id;
    }).catch(error => {
      console.error('Error recording user session metric:', error);
      return undefined;
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing user session metric:', error);
    return undefined;
  }
}

/**
 * Update an existing user session (e.g., to mark it as completed)
 * 
 * @param data Session update data
 * @returns Promise that resolves when the session is updated
 */
export async function updateUserSessionMetric({
  sessionId,
  endTime = new Date(),
  status = 'completed',
  metadata,
}: {
  sessionId: string;
  endTime?: Date;
  status?: 'active' | 'completed' | 'terminated';
  metadata?: Record<string, any>;
}) {
  try {
    return Promise.resolve().then(async () => {
      // Get the current session to calculate duration
      const existingSession = await db.select().from(userSession).where(
        eq(userSession.id, sessionId)
      ).limit(1);
      
      if (existingSession.length === 0) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      const session = existingSession[0];
      const startTime = session.startTime;
      
      // Calculate duration in seconds
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Update the session
      await db.update(userSession)
        .set({
          endTime,
          status,
          duration,
          metadata: { ...(session.metadata as Record<string, any> || {}), ...(metadata || {}) },
        })
        .where(eq(userSession.id, sessionId));
      
      // Also record a general metric event
      await recordMetricEvent({
        userId: session.userId,
        eventType: 'session',
        category: 'user',
        action: 'session_end',
        metadata: {
          sessionId,
          duration,
          status,
        },
      });
      
      console.log(`User session updated: ${sessionId}, duration: ${duration}s`);
    }).catch(error => {
      console.error('Error updating user session metric:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing user session update:', error);
  }
}

/**
 * Record a user activity metric
 * 
 * @param data User activity data
 * @returns Promise that resolves when the metric is recorded
 */
export async function recordUserActivityMetric({
  userId,
  activityType,
  resourceType,
  resourceId,
  duration,
  metadata,
}: {
  userId: string;
  activityType: string;
  resourceType?: string;
  resourceId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}) {
  try {
    return Promise.resolve().then(async () => {
      // Record the specific user activity metric
      await db.insert(userActivityMetric).values({
        userId,
        activityType,
        resourceType,
        resourceId,
        duration,
        timestamp: new Date(),
        metadata,
      });
      
      // Also record a general metric event
      await recordMetricEvent({
        userId,
        eventType: 'activity',
        category: 'user',
        action: activityType,
        metadata: {
          resourceType,
          resourceId,
          duration,
        },
      });
      
      console.log(`User activity recorded: ${activityType}`);
    }).catch(error => {
      console.error('Error recording user activity metric:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing user activity metric:', error);
  }
}

/**
 * Record a system performance metric
 * 
 * @param data System performance data
 * @returns Promise that resolves when the metric is recorded
 */
export async function recordSystemPerformanceMetric({
  metricType,
  value,
  unit,
  component,
  metadata,
}: {
  metricType: string;
  value: number;
  unit: string;
  component: string;
  metadata?: Record<string, any>;
}) {
  try {
    return Promise.resolve().then(async () => {
      // Record the specific system performance metric
      await db.insert(systemPerformanceMetric).values({
        metricType,
        value,
        unit,
        component,
        timestamp: new Date(),
        metadata,
      });
      
      // Also record a general metric event
      await recordMetricEvent({
        eventType: 'performance',
        category: 'system',
        action: metricType,
        metadata: {
          value,
          unit,
          component,
        },
      });
      
      console.log(`System performance metric recorded: ${metricType} = ${value}${unit}`);
    }).catch(error => {
      console.error('Error recording system performance metric:', error);
    });
  } catch (error) {
    // Catch any synchronous errors
    console.error('Error preparing system performance metric:', error);
  }
}