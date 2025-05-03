-- Migration to add clientId and clientSecret columns to GoogleIntegration table
-- These columns store user-provided credentials instead of using environment variables

-- Add the new columns
ALTER TABLE "GoogleIntegration" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "GoogleIntegration" ADD COLUMN IF NOT EXISTS "clientSecret" TEXT;

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN "GoogleIntegration"."clientId" IS 'User-provided Google client ID';
COMMENT ON COLUMN "GoogleIntegration"."clientSecret" IS 'User-provided Google client secret';