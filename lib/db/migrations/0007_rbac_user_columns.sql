-- Add role, status, and lastActive columns to User table with error handling
DO $$ 
BEGIN
  -- Only add the columns if they don't already exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
  ) THEN
    -- Match the schema.ts definition: varchar('role', { enum: ['user', 'admin', 'superuser'] })
    ALTER TABLE "User" ADD COLUMN "role" VARCHAR CHECK ("role" IN ('user', 'admin', 'superuser')) NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'status'
  ) THEN
    -- Match the schema.ts definition: varchar('status', { enum: ['active', 'inactive', 'pending'] })
    ALTER TABLE "User" ADD COLUMN "status" VARCHAR CHECK ("status" IN ('active', 'inactive', 'pending')) NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'lastActive'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastActive" TIMESTAMP;
  END IF;
END $$;
