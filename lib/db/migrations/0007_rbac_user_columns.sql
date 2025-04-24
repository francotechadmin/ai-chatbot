-- Add role, status, and lastActive columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "role" VARCHAR(10) NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS "status" VARCHAR(10) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP;

-- Update the meta table to record this migration
