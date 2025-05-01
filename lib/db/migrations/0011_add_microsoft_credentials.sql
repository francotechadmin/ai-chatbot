-- Migration to add clientId and clientSecret columns to MicrosoftIntegration table
-- These columns store user-provided credentials instead of using environment variables

-- Add the new columns
ALTER TABLE "MicrosoftIntegration" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "MicrosoftIntegration" ADD COLUMN IF NOT EXISTS "clientSecret" TEXT;

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN "MicrosoftIntegration"."clientId" IS 'User-provided Microsoft client ID';
COMMENT ON COLUMN "MicrosoftIntegration"."clientSecret" IS 'User-provided Microsoft client secret';