-- Migration to create the GoogleIntegration table for storing Google Drive integration data

-- Create the GoogleIntegration table
CREATE TABLE IF NOT EXISTS "GoogleIntegration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
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
  "clientSecret" TEXT
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS "google_integration_user_id_idx" ON "GoogleIntegration"("userId");

-- Add constraints
ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "unique_user_google_integration" UNIQUE ("userId");

-- Add comments
COMMENT ON TABLE "GoogleIntegration" IS 'Stores Google Drive integration information for users';
COMMENT ON COLUMN "GoogleIntegration"."accessToken" IS 'OAuth access token';
COMMENT ON COLUMN "GoogleIntegration"."refreshToken" IS 'OAuth refresh token';
COMMENT ON COLUMN "GoogleIntegration"."expiresAt" IS 'When the access token expires';
COMMENT ON COLUMN "GoogleIntegration"."providerUserId" IS 'User ID from Google';
COMMENT ON COLUMN "GoogleIntegration"."clientId" IS 'User-provided Google client ID';
COMMENT ON COLUMN "GoogleIntegration"."clientSecret" IS 'User-provided Google client secret';