-- Create pgvector extension (required)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create KnowledgeSource table
CREATE TABLE IF NOT EXISTS "KnowledgeSource" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sourceType" VARCHAR NOT NULL CHECK ("sourceType" IN ('chat', 'document', 'image', 'video', 'webpage', 'api')),
  "sourceId" UUID,
  "status" VARCHAR NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'rejected')),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "approvedBy" UUID REFERENCES "User"("id"),
  "approvedAt" TIMESTAMP,
  "metadata" JSONB
);

-- Create KnowledgeChunk table
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sourceId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
  "content" TEXT NOT NULL,
  "embedding" vector(1536), -- OpenAI's text-embedding-3-small uses 1536 dimensions
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL
);

-- Create KnowledgeRelation table
CREATE TABLE IF NOT EXISTS "KnowledgeRelation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sourceId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
  "targetId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
  "relationType" VARCHAR NOT NULL CHECK ("relationType" IN ('related', 'part_of', 'references', 'contradicts', 'supports')),
  "strength" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_knowledge_source_status" ON "KnowledgeSource"("status");
CREATE INDEX IF NOT EXISTS "idx_knowledge_source_type" ON "KnowledgeSource"("sourceType");
CREATE INDEX IF NOT EXISTS "idx_knowledge_source_user" ON "KnowledgeSource"("userId");
CREATE INDEX IF NOT EXISTS "idx_knowledge_chunk_source" ON "KnowledgeChunk"("sourceId");
CREATE INDEX IF NOT EXISTS "idx_knowledge_relation_source" ON "KnowledgeRelation"("sourceId");
CREATE INDEX IF NOT EXISTS "idx_knowledge_relation_target" ON "KnowledgeRelation"("targetId");
