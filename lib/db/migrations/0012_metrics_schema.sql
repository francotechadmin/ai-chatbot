-- Migration to add metrics collection system tables
-- This includes raw event data tables and aggregated metrics tables

-- Raw Event Data Tables

-- Create MetricEvent table - Core table for all events
CREATE TABLE IF NOT EXISTS "MetricEvent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID REFERENCES "User"("id"),
  "eventType" VARCHAR NOT NULL,
  "category" VARCHAR NOT NULL,
  "action" VARCHAR NOT NULL,
  "metadata" JSONB,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create UserSession table - Tracks user login/logout with session info
CREATE TABLE IF NOT EXISTS "UserSession" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP,
  "duration" INTEGER, -- in seconds, calculated on session end
  "deviceInfo" JSONB,
  "ipAddress" VARCHAR,
  "userAgent" TEXT,
  "status" VARCHAR NOT NULL CHECK ("status" IN ('active', 'completed', 'terminated')),
  "metadata" JSONB
);

-- Create QueryMetric table - Detailed metrics for chat/query operations
CREATE TABLE IF NOT EXISTS "QueryMetric" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chatId" UUID REFERENCES "Chat"("id"),
  "userId" UUID REFERENCES "User"("id"),
  "messageId" UUID,
  "queryText" TEXT,
  "responseTime" INTEGER NOT NULL, -- in milliseconds
  "tokenCount" INTEGER,
  "promptTokens" INTEGER,
  "completionTokens" INTEGER,
  "modelUsed" VARCHAR,
  "knowledgeBaseUsed" BOOLEAN DEFAULT FALSE,
  "knowledgeSourceIds" UUID[],
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- Create KnowledgeBaseMetric table - Metrics for knowledge base operations
CREATE TABLE IF NOT EXISTS "KnowledgeBaseMetric" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID REFERENCES "User"("id"),
  "operation" VARCHAR NOT NULL CHECK ("operation" IN ('upload', 'search', 'retrieve', 'update', 'delete')),
  "knowledgeSourceId" UUID REFERENCES "KnowledgeSource"("id"),
  "responseTime" INTEGER, -- in milliseconds
  "resultCount" INTEGER,
  "queryText" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- Create UserActivityMetric table - General user interactions
CREATE TABLE IF NOT EXISTS "UserActivityMetric" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "activityType" VARCHAR NOT NULL,
  "resourceType" VARCHAR,
  "resourceId" UUID,
  "duration" INTEGER, -- in seconds
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- Create SystemPerformanceMetric table - System-level metrics
CREATE TABLE IF NOT EXISTS "SystemPerformanceMetric" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "value" FLOAT NOT NULL,
  "unit" VARCHAR NOT NULL,
  "component" VARCHAR NOT NULL,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- Aggregated Metrics Tables

-- Create DailyMetricAggregate table - Daily rollups
CREATE TABLE IF NOT EXISTS "DailyMetricAggregate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "date" DATE NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "dimension" VARCHAR NOT NULL,
  "dimensionValue" VARCHAR,
  "count" INTEGER NOT NULL DEFAULT 0,
  "sum" FLOAT,
  "avg" FLOAT,
  "min" FLOAT,
  "max" FLOAT,
  "metadata" JSONB,
  UNIQUE("date", "metricType", "dimension", "dimensionValue")
);

-- Create WeeklyMetricAggregate table - Weekly aggregations
CREATE TABLE IF NOT EXISTS "WeeklyMetricAggregate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "year" INTEGER NOT NULL,
  "week" INTEGER NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "dimension" VARCHAR NOT NULL,
  "dimensionValue" VARCHAR,
  "count" INTEGER NOT NULL DEFAULT 0,
  "sum" FLOAT,
  "avg" FLOAT,
  "min" FLOAT,
  "max" FLOAT,
  "metadata" JSONB,
  UNIQUE("year", "week", "metricType", "dimension", "dimensionValue")
);

-- Create MonthlyMetricAggregate table - Monthly aggregations
CREATE TABLE IF NOT EXISTS "MonthlyMetricAggregate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "dimension" VARCHAR NOT NULL,
  "dimensionValue" VARCHAR,
  "count" INTEGER NOT NULL DEFAULT 0,
  "sum" FLOAT,
  "avg" FLOAT,
  "min" FLOAT,
  "max" FLOAT,
  "metadata" JSONB,
  UNIQUE("year", "month", "metricType", "dimension", "dimensionValue")
);

-- Create QuarterlyMetricAggregate table - Quarterly data
CREATE TABLE IF NOT EXISTS "QuarterlyMetricAggregate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "year" INTEGER NOT NULL,
  "quarter" INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  "metricType" VARCHAR NOT NULL,
  "dimension" VARCHAR NOT NULL,
  "dimensionValue" VARCHAR,
  "count" INTEGER NOT NULL DEFAULT 0,
  "sum" FLOAT,
  "avg" FLOAT,
  "min" FLOAT,
  "max" FLOAT,
  "metadata" JSONB,
  UNIQUE("year", "quarter", "metricType", "dimension", "dimensionValue")
);

-- Create YearlyMetricAggregate table - Annual data
CREATE TABLE IF NOT EXISTS "YearlyMetricAggregate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "year" INTEGER NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "dimension" VARCHAR NOT NULL,
  "dimensionValue" VARCHAR,
  "count" INTEGER NOT NULL DEFAULT 0,
  "sum" FLOAT,
  "avg" FLOAT,
  "min" FLOAT,
  "max" FLOAT,
  "metadata" JSONB,
  UNIQUE("year", "metricType", "dimension", "dimensionValue")
);

-- Create indexes for better performance
-- Raw Event Data indexes
CREATE INDEX IF NOT EXISTS "idx_metric_event_user" ON "MetricEvent"("userId");
CREATE INDEX IF NOT EXISTS "idx_metric_event_type" ON "MetricEvent"("eventType");
CREATE INDEX IF NOT EXISTS "idx_metric_event_category" ON "MetricEvent"("category");
CREATE INDEX IF NOT EXISTS "idx_metric_event_timestamp" ON "MetricEvent"("timestamp");

CREATE INDEX IF NOT EXISTS "idx_user_session_user" ON "UserSession"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_session_status" ON "UserSession"("status");
CREATE INDEX IF NOT EXISTS "idx_user_session_time" ON "UserSession"("startTime", "endTime");

CREATE INDEX IF NOT EXISTS "idx_query_metric_user" ON "QueryMetric"("userId");
CREATE INDEX IF NOT EXISTS "idx_query_metric_chat" ON "QueryMetric"("chatId");
CREATE INDEX IF NOT EXISTS "idx_query_metric_timestamp" ON "QueryMetric"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_query_metric_kb_used" ON "QueryMetric"("knowledgeBaseUsed");

CREATE INDEX IF NOT EXISTS "idx_kb_metric_user" ON "KnowledgeBaseMetric"("userId");
CREATE INDEX IF NOT EXISTS "idx_kb_metric_operation" ON "KnowledgeBaseMetric"("operation");
CREATE INDEX IF NOT EXISTS "idx_kb_metric_source" ON "KnowledgeBaseMetric"("knowledgeSourceId");
CREATE INDEX IF NOT EXISTS "idx_kb_metric_timestamp" ON "KnowledgeBaseMetric"("timestamp");

CREATE INDEX IF NOT EXISTS "idx_user_activity_user" ON "UserActivityMetric"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_activity_type" ON "UserActivityMetric"("activityType");
CREATE INDEX IF NOT EXISTS "idx_user_activity_timestamp" ON "UserActivityMetric"("timestamp");

CREATE INDEX IF NOT EXISTS "idx_system_perf_type" ON "SystemPerformanceMetric"("metricType");
CREATE INDEX IF NOT EXISTS "idx_system_perf_component" ON "SystemPerformanceMetric"("component");
CREATE INDEX IF NOT EXISTS "idx_system_perf_timestamp" ON "SystemPerformanceMetric"("timestamp");

-- Aggregated Metrics indexes
CREATE INDEX IF NOT EXISTS "idx_daily_metric_date" ON "DailyMetricAggregate"("date");
CREATE INDEX IF NOT EXISTS "idx_daily_metric_type" ON "DailyMetricAggregate"("metricType");
CREATE INDEX IF NOT EXISTS "idx_daily_metric_dimension" ON "DailyMetricAggregate"("dimension", "dimensionValue");

CREATE INDEX IF NOT EXISTS "idx_weekly_metric_year_week" ON "WeeklyMetricAggregate"("year", "week");
CREATE INDEX IF NOT EXISTS "idx_weekly_metric_type" ON "WeeklyMetricAggregate"("metricType");
CREATE INDEX IF NOT EXISTS "idx_weekly_metric_dimension" ON "WeeklyMetricAggregate"("dimension", "dimensionValue");

CREATE INDEX IF NOT EXISTS "idx_monthly_metric_year_month" ON "MonthlyMetricAggregate"("year", "month");
CREATE INDEX IF NOT EXISTS "idx_monthly_metric_type" ON "MonthlyMetricAggregate"("metricType");
CREATE INDEX IF NOT EXISTS "idx_monthly_metric_dimension" ON "MonthlyMetricAggregate"("dimension", "dimensionValue");

CREATE INDEX IF NOT EXISTS "idx_quarterly_metric_year_quarter" ON "QuarterlyMetricAggregate"("year", "quarter");
CREATE INDEX IF NOT EXISTS "idx_quarterly_metric_type" ON "QuarterlyMetricAggregate"("metricType");
CREATE INDEX IF NOT EXISTS "idx_quarterly_metric_dimension" ON "QuarterlyMetricAggregate"("dimension", "dimensionValue");

CREATE INDEX IF NOT EXISTS "idx_yearly_metric_year" ON "YearlyMetricAggregate"("year");
CREATE INDEX IF NOT EXISTS "idx_yearly_metric_type" ON "YearlyMetricAggregate"("metricType");
CREATE INDEX IF NOT EXISTS "idx_yearly_metric_dimension" ON "YearlyMetricAggregate"("dimension", "dimensionValue");

-- Add comments for clarity
COMMENT ON TABLE "MetricEvent" IS 'Core table for all events with fields for userId, eventType, category, action, and metadata';
COMMENT ON TABLE "UserSession" IS 'Tracks user login/logout with session duration and device info';
COMMENT ON TABLE "QueryMetric" IS 'Detailed metrics for chat/query operations including response time, token count, and knowledge base usage';
COMMENT ON TABLE "KnowledgeBaseMetric" IS 'Metrics for knowledge base operations like uploads and searches';
COMMENT ON TABLE "UserActivityMetric" IS 'General user interactions with the system';
COMMENT ON TABLE "SystemPerformanceMetric" IS 'System-level metrics for monitoring performance';

COMMENT ON TABLE "DailyMetricAggregate" IS 'Daily rollups of metrics by type and dimension';
COMMENT ON TABLE "WeeklyMetricAggregate" IS 'Weekly aggregations for medium-term analysis';
COMMENT ON TABLE "MonthlyMetricAggregate" IS 'Monthly aggregations for long-term trends';
COMMENT ON TABLE "QuarterlyMetricAggregate" IS 'Quarterly data for executive reporting';
COMMENT ON TABLE "YearlyMetricAggregate" IS 'Annual data for long-term retention';