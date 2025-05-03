
BEGIN
  -- Check if the constraint exists before trying to drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Document_id_createdAt' 
    AND conrelid = 'public."Document"'::regclass
  ) THEN
    ALTER TABLE "Document" DROP CONSTRAINT "Document_id_createdAt";
  END IF;

END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GoogleIntegration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "tokenType" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "providerUserId" TEXT,
  "providerUserEmail" TEXT,
  "providerUserName" TEXT,
  "clientId" TEXT,
  "clientSecret" TEXT,
  CONSTRAINT "fk_google_integration_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "google_integration_user_id_idx" ON "GoogleIntegration"("userId");
--> statement-breakpoint
ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "unique_user_google_integration" UNIQUE ("userId");
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
DROP INDEX IF EXISTS "idx_knowledge_chunk_source";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_knowledge_relation_source";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_knowledge_relation_target";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_knowledge_source_status";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_knowledge_source_type";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_knowledge_source_user";--> statement-breakpoint
ALTER TABLE "Document" DROP CONSTRAINT "Document_id_createdAt";--> statement-breakpoint
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_id";--> statement-breakpoint
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_chatId_messageId";--> statement-breakpoint
ALTER TABLE "Vote_v2" DROP CONSTRAINT "Vote_v2_chatId_messageId";--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "embedding" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "metadata" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "KnowledgeSource" ALTER COLUMN "metadata" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "Message" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "Message_v2" ALTER COLUMN "parts" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "Message_v2" ALTER COLUMN "attachments" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_id_createdAt_pk" PRIMARY KEY("id","createdAt");--> statement-breakpoint
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_id_pk" PRIMARY KEY("id");--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_chatId_messageId_pk" PRIMARY KEY("chatId","messageId");--> statement-breakpoint
ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_messageId_pk" PRIMARY KEY("chatId","messageId");--> statement-breakpoint
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
CREATE UNIQUE INDEX IF NOT EXISTS "unq_yearly_metric" ON "YearlyMetricAggregate" USING btree ("year","metricType","dimension","dimensionValue");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
