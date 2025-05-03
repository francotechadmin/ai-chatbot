-- Migration for Google Integration only

-- Create the GoogleIntegration table
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

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS "google_integration_user_id_idx" ON "GoogleIntegration"("userId");

-- Add constraints
ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "unique_user_google_integration" UNIQUE ("userId");