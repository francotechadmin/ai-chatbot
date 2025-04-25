const { config } = require('dotenv');
const postgres = require('postgres');

config({
  path: '.env.local',
});

async function applyKnowledgeBaseMigration() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined');
    process.exit(1);
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    console.log('Applying Knowledge Base migration...');
    
    // Create KnowledgeSource table
    await connection`
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
      )
    `;
    console.log('Created KnowledgeSource table');
    
    // Create KnowledgeChunk table
    await connection`
      CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "sourceId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
        "content" TEXT NOT NULL,
        "embedding" JSONB,
        "metadata" JSONB,
        "createdAt" TIMESTAMP NOT NULL
      )
    `;
    console.log('Created KnowledgeChunk table');
    
    // Create KnowledgeRelation table
    await connection`
      CREATE TABLE IF NOT EXISTS "KnowledgeRelation" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "sourceId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
        "targetId" UUID NOT NULL REFERENCES "KnowledgeSource"("id"),
        "relationType" VARCHAR NOT NULL CHECK ("relationType" IN ('related', 'part_of', 'references', 'contradicts', 'supports')),
        "strength" INTEGER NOT NULL DEFAULT 5,
        "createdAt" TIMESTAMP NOT NULL
      )
    `;
    console.log('Created KnowledgeRelation table');
    
    // Create indexes
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_source_status" ON "KnowledgeSource"("status")
    `;
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_source_type" ON "KnowledgeSource"("sourceType")
    `;
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_source_user" ON "KnowledgeSource"("userId")
    `;
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_chunk_source" ON "KnowledgeChunk"("sourceId")
    `;
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_relation_source" ON "KnowledgeRelation"("sourceId")
    `;
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_knowledge_relation_target" ON "KnowledgeRelation"("targetId")
    `;
    console.log('Created indexes');
    
    // Update drizzle migrations table to mark this migration as applied
    try {
      await connection`
        INSERT INTO drizzle.__drizzle_migrations (migration_name, hash, created_at)
        VALUES ('0009_knowledge_base_schema', 'manual_migration', NOW())
      `;
      console.log('Updated migrations table');
    } catch (error) {
      console.error('Error updating migrations table:', error);
    }
    
    console.log('Knowledge Base migration applied successfully');
    
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

applyKnowledgeBaseMigration();
