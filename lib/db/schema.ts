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
