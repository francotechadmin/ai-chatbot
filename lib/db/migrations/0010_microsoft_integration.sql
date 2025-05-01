-- Create MicrosoftIntegration table
CREATE TABLE IF NOT EXISTS "MicrosoftIntegration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "tokenType" VARCHAR NOT NULL,
  "scope" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_microsoft_integration_user" ON "MicrosoftIntegration"("userId");