CREATE TABLE IF NOT EXISTS "DailyMetricAggregate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"metricType" varchar NOT NULL,
	"dimension" varchar NOT NULL,
	"dimensionValue" varchar,
	"count" integer DEFAULT 0 NOT NULL,
	"sum" real,
	"avg" real,
	"min" real,
	"max" real,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GoogleIntegration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"tokenType" text NOT NULL,
	"scope" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"providerUserId" text,
	"providerUserEmail" text,
	"providerUserName" text,
	"clientId" text,
	"clientSecret" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KnowledgeBaseMetric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"operation" varchar NOT NULL,
	"knowledgeSourceId" uuid,
	"responseTime" integer,
	"resultCount" integer,
	"queryText" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceId" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" json,
	"metadata" json,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KnowledgeRelation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceId" uuid NOT NULL,
	"targetId" uuid NOT NULL,
	"relationType" varchar NOT NULL,
	"strength" integer DEFAULT 5 NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KnowledgeSource" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sourceType" varchar NOT NULL,
	"sourceId" uuid,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"userId" uuid NOT NULL,
	"approvedBy" uuid,
	"approvedAt" timestamp,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MetricEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"eventType" varchar NOT NULL,
	"category" varchar NOT NULL,
	"action" varchar NOT NULL,
	"metadata" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MicrosoftIntegration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"tokenType" varchar NOT NULL,
	"scope" text NOT NULL,
	"clientId" text,
	"clientSecret" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MonthlyMetricAggregate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"metricType" varchar NOT NULL,
	"dimension" varchar NOT NULL,
	"dimensionValue" varchar,
	"count" integer DEFAULT 0 NOT NULL,
	"sum" real,
	"avg" real,
	"min" real,
	"max" real,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "QuarterlyMetricAggregate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer NOT NULL,
	"metricType" varchar NOT NULL,
	"dimension" varchar NOT NULL,
	"dimensionValue" varchar,
	"count" integer DEFAULT 0 NOT NULL,
	"sum" real,
	"avg" real,
	"min" real,
	"max" real,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "QueryMetric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid,
	"userId" uuid,
	"messageId" uuid,
	"queryText" text,
	"responseTime" integer NOT NULL,
	"tokenCount" integer,
	"promptTokens" integer,
	"completionTokens" integer,
	"modelUsed" varchar,
	"knowledgeBaseUsed" boolean DEFAULT false,
	"knowledgeSourceIds" json,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SystemPerformanceMetric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metricType" varchar NOT NULL,
	"value" real NOT NULL,
	"unit" varchar NOT NULL,
	"component" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserActivityMetric" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"activityType" varchar NOT NULL,
	"resourceType" varchar,
	"resourceId" uuid,
	"duration" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSession" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp,
	"duration" integer,
	"deviceInfo" json,
	"ipAddress" varchar,
	"userAgent" text,
	"status" varchar NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WeeklyMetricAggregate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"week" integer NOT NULL,
	"metricType" varchar NOT NULL,
	"dimension" varchar NOT NULL,
	"dimensionValue" varchar,
	"count" integer DEFAULT 0 NOT NULL,
	"sum" real,
	"avg" real,
	"min" real,
	"max" real,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "YearlyMetricAggregate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"metricType" varchar NOT NULL,
	"dimension" varchar NOT NULL,
	"dimensionValue" varchar,
	"count" integer DEFAULT 0 NOT NULL,
	"sum" real,
	"avg" real,
	"min" real,
	"max" real,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "GoogleIntegration_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeBaseMetric" ADD CONSTRAINT "KnowledgeBaseMetric_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeBaseMetric" ADD CONSTRAINT "KnowledgeBaseMetric_knowledgeSourceId_KnowledgeSource_id_fk" FOREIGN KEY ("knowledgeSourceId") REFERENCES "public"."KnowledgeSource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_sourceId_KnowledgeSource_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."KnowledgeSource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_sourceId_KnowledgeSource_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."KnowledgeSource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_targetId_KnowledgeSource_id_fk" FOREIGN KEY ("targetId") REFERENCES "public"."KnowledgeSource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_approvedBy_User_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MetricEvent" ADD CONSTRAINT "MetricEvent_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MicrosoftIntegration" ADD CONSTRAINT "MicrosoftIntegration_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "QueryMetric" ADD CONSTRAINT "QueryMetric_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "QueryMetric" ADD CONSTRAINT "QueryMetric_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserActivityMetric" ADD CONSTRAINT "UserActivityMetric_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_daily_metric" ON "DailyMetricAggregate" USING btree ("date","metricType","dimension","dimensionValue");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_monthly_metric" ON "MonthlyMetricAggregate" USING btree ("year","month","metricType","dimension","dimensionValue");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_quarterly_metric" ON "QuarterlyMetricAggregate" USING btree ("year","quarter","metricType","dimension","dimensionValue");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_weekly_metric" ON "WeeklyMetricAggregate" USING btree ("year","week","metricType","dimension","dimensionValue");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_yearly_metric" ON "YearlyMetricAggregate" USING btree ("year","metricType","dimension","dimensionValue");