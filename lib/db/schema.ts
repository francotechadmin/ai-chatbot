import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  date,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Custom vector type for pgvector
const pgvector = (dimensions: number) => 
  sql`vector(${sql.raw(dimensions.toString())})`.as('pg_vector');

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  role: varchar('role', { enum: ['user', 'admin', 'superuser'] })
    .notNull()
    .default('user'),
  status: varchar('status', { enum: ['active', 'inactive', 'pending'] })
    .notNull()
    .default('active'),
  lastActive: timestamp('lastActive'),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  type: varchar('type', { enum: ['general', 'query', 'capture'] })
    .notNull()
    .default('general'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// Knowledge Base Schema

export const knowledgeSource = pgTable('KnowledgeSource', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sourceType: varchar('sourceType', { 
    enum: ['chat', 'document', 'image', 'video', 'webpage', 'api'] 
  }).notNull(),
  sourceId: uuid('sourceId'), // Reference to original source (chat, document, etc.)
  status: varchar('status', { 
    enum: ['pending', 'approved', 'rejected'] 
  }).notNull().default('pending'),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  approvedBy: uuid('approvedBy')
    .references(() => user.id),
  approvedAt: timestamp('approvedAt'),
  metadata: json('metadata'), // For source-specific metadata
});

export type KnowledgeSource = InferSelectModel<typeof knowledgeSource>;

export const knowledgeChunk = pgTable('KnowledgeChunk', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sourceId: uuid('sourceId')
    .notNull()
    .references(() => knowledgeSource.id),
  content: text('content').notNull(),
  embedding: json('embedding'), // Vector embedding for similarity search (stored as JSON in schema but as vector in DB)
  metadata: json('metadata'), // Position in document, context, etc.
  createdAt: timestamp('createdAt').notNull(),
});

export type KnowledgeChunk = InferSelectModel<typeof knowledgeChunk>;

export const knowledgeRelation = pgTable('KnowledgeRelation', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sourceId: uuid('sourceId')
    .notNull()
    .references(() => knowledgeSource.id),
  targetId: uuid('targetId')
    .notNull()
    .references(() => knowledgeSource.id),
  relationType: varchar('relationType', { 
    enum: ['related', 'part_of', 'references', 'contradicts', 'supports'] 
  }).notNull(),
  strength: integer('strength').notNull().default(5), // 1-10 scale
  createdAt: timestamp('createdAt').notNull(),
});

export type KnowledgeRelation = InferSelectModel<typeof knowledgeRelation>;

// Microsoft Integration Schema
export const microsoftIntegration = pgTable('MicrosoftIntegration', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken').notNull(),
  refreshToken: text('refreshToken').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  tokenType: varchar('tokenType').notNull(),
  scope: text('scope').notNull(),
  clientId: text('clientId'),         // User-provided client ID
  clientSecret: text('clientSecret'), // User-provided client secret
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export type MicrosoftIntegration = InferSelectModel<typeof microsoftIntegration>;

// Google Integration Schema
export const googleIntegration = pgTable("GoogleIntegration", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenType: text("tokenType").notNull(),
  scope: text("scope").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  providerUserId: text("providerUserId"),
  providerUserEmail: text("providerUserEmail"),
  providerUserName: text("providerUserName"),
  clientId: text("clientId"),
  clientSecret: text("clientSecret"),
});

export type GoogleIntegration = InferSelectModel<typeof googleIntegration>;

// Metrics Collection System Schema

// Raw Event Data Tables
export const metricEvent = pgTable('MetricEvent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').references(() => user.id),
  eventType: varchar('eventType').notNull(),
  category: varchar('category').notNull(),
  action: varchar('action').notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export type MetricEvent = InferSelectModel<typeof metricEvent>;

export const userSession = pgTable('UserSession', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  startTime: timestamp('startTime').notNull(),
  endTime: timestamp('endTime'),
  duration: integer('duration'), // in seconds, calculated on session end
  deviceInfo: json('deviceInfo'),
  ipAddress: varchar('ipAddress'),
  userAgent: text('userAgent'),
  status: varchar('status', { enum: ['active', 'completed', 'terminated'] }).notNull(),
  metadata: json('metadata'),
});

export type UserSession = InferSelectModel<typeof userSession>;

export const queryMetric = pgTable('QueryMetric', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId').references(() => chat.id),
  userId: uuid('userId').references(() => user.id),
  messageId: uuid('messageId'),
  queryText: text('queryText'),
  responseTime: integer('responseTime').notNull(), // in milliseconds
  tokenCount: integer('tokenCount'),
  promptTokens: integer('promptTokens'),
  completionTokens: integer('completionTokens'),
  modelUsed: varchar('modelUsed'),
  knowledgeBaseUsed: boolean('knowledgeBaseUsed').default(false),
  knowledgeSourceIds: json('knowledgeSourceIds'), // UUID array stored as JSON
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: json('metadata'),
});

export type QueryMetric = InferSelectModel<typeof queryMetric>;

export const knowledgeBaseMetric = pgTable('KnowledgeBaseMetric', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').references(() => user.id),
  operation: varchar('operation', {
    enum: ['upload', 'search', 'retrieve', 'update', 'delete']
  }).notNull(),
  knowledgeSourceId: uuid('knowledgeSourceId').references(() => knowledgeSource.id),
  responseTime: integer('responseTime'), // in milliseconds
  resultCount: integer('resultCount'),
  queryText: text('queryText'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: json('metadata'),
});

export type KnowledgeBaseMetric = InferSelectModel<typeof knowledgeBaseMetric>;

export const userActivityMetric = pgTable('UserActivityMetric', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  activityType: varchar('activityType').notNull(),
  resourceType: varchar('resourceType'),
  resourceId: uuid('resourceId'),
  duration: integer('duration'), // in seconds
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: json('metadata'),
});

export type UserActivityMetric = InferSelectModel<typeof userActivityMetric>;

export const systemPerformanceMetric = pgTable('SystemPerformanceMetric', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  metricType: varchar('metricType').notNull(),
  value: real('value').notNull(),
  unit: varchar('unit').notNull(),
  component: varchar('component').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: json('metadata'),
});

export type SystemPerformanceMetric = InferSelectModel<typeof systemPerformanceMetric>;

// Aggregated Metrics Tables
export const dailyMetricAggregate = pgTable('DailyMetricAggregate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  date: date('date').notNull(),
  metricType: varchar('metricType').notNull(),
  dimension: varchar('dimension').notNull(),
  dimensionValue: varchar('dimensionValue'),
  count: integer('count').notNull().default(0),
  sum: real('sum'),
  avg: real('avg'),
  min: real('min'),
  max: real('max'),
  metadata: json('metadata'),
}, (table) => {
  return {
    unq: uniqueIndex('unq_daily_metric').on(
      table.date,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
  };
});

export type DailyMetricAggregate = InferSelectModel<typeof dailyMetricAggregate>;

export const weeklyMetricAggregate = pgTable('WeeklyMetricAggregate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  year: integer('year').notNull(),
  week: integer('week').notNull(),
  metricType: varchar('metricType').notNull(),
  dimension: varchar('dimension').notNull(),
  dimensionValue: varchar('dimensionValue'),
  count: integer('count').notNull().default(0),
  sum: real('sum'),
  avg: real('avg'),
  min: real('min'),
  max: real('max'),
  metadata: json('metadata'),
}, (table) => {
  return {
    unq: uniqueIndex('unq_weekly_metric').on(
      table.year,
      table.week,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
  };
});

export type WeeklyMetricAggregate = InferSelectModel<typeof weeklyMetricAggregate>;

export const monthlyMetricAggregate = pgTable('MonthlyMetricAggregate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  metricType: varchar('metricType').notNull(),
  dimension: varchar('dimension').notNull(),
  dimensionValue: varchar('dimensionValue'),
  count: integer('count').notNull().default(0),
  sum: real('sum'),
  avg: real('avg'),
  min: real('min'),
  max: real('max'),
  metadata: json('metadata'),
}, (table) => {
  return {
    unq: uniqueIndex('unq_monthly_metric').on(
      table.year,
      table.month,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
  };
});

export type MonthlyMetricAggregate = InferSelectModel<typeof monthlyMetricAggregate>;

export const quarterlyMetricAggregate = pgTable('QuarterlyMetricAggregate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  year: integer('year').notNull(),
  quarter: integer('quarter').notNull(),
  metricType: varchar('metricType').notNull(),
  dimension: varchar('dimension').notNull(),
  dimensionValue: varchar('dimensionValue'),
  count: integer('count').notNull().default(0),
  sum: real('sum'),
  avg: real('avg'),
  min: real('min'),
  max: real('max'),
  metadata: json('metadata'),
}, (table) => {
  return {
    unq: uniqueIndex('unq_quarterly_metric').on(
      table.year,
      table.quarter,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
  };
});

export type QuarterlyMetricAggregate = InferSelectModel<typeof quarterlyMetricAggregate>;

export const yearlyMetricAggregate = pgTable('YearlyMetricAggregate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  year: integer('year').notNull(),
  metricType: varchar('metricType').notNull(),
  dimension: varchar('dimension').notNull(),
  dimensionValue: varchar('dimensionValue'),
  count: integer('count').notNull().default(0),
  sum: real('sum'),
  avg: real('avg'),
  min: real('min'),
  max: real('max'),
  metadata: json('metadata'),
}, (table) => {
  return {
    unq: uniqueIndex('unq_yearly_metric').on(
      table.year,
      table.metricType,
      table.dimension,
      table.dimensionValue
    ),
  };
});

export type YearlyMetricAggregate = InferSelectModel<typeof yearlyMetricAggregate>;

// Voice Integration Schema
export const voiceSession = pgTable('voice_sessions', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chat_id').references(() => chat.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds'),
  voice: text('voice').notNull().default('alloy'),
  model: text('model').notNull().default('gpt-4o-realtime'),
  metadata: json('metadata'),
});

export type VoiceSession = InferSelectModel<typeof voiceSession>;

export const voiceTranscription = pgTable('voice_transcriptions', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sessionId: uuid('session_id').references(() => voiceSession.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id').references(() => message.id, { onDelete: 'cascade' }),
  transcript: text('transcript').notNull(),
  confidence: real('confidence'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type VoiceTranscription = InferSelectModel<typeof voiceTranscription>;
