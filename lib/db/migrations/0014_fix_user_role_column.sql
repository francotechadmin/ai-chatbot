-- Fix User table columns that might be missing in production
DO $$ 
BEGIN
  -- First check if the User table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    -- Check if the role column already exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
    ) THEN
      -- Add the role column with the correct data type from the start
      -- Match the schema.ts definition: varchar('role', { enum: ['user', 'admin', 'superuser'] })
      ALTER TABLE "User" ADD COLUMN "role" VARCHAR CHECK ("role" IN ('user', 'admin', 'superuser')) NOT NULL DEFAULT 'user';
    END IF;
    
    -- Check if the status column already exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'status'
    ) THEN
      -- Add the status column with the correct data type
      -- Match the schema.ts definition: varchar('status', { enum: ['active', 'inactive', 'pending'] })
      ALTER TABLE "User" ADD COLUMN "status" VARCHAR CHECK ("status" IN ('active', 'inactive', 'pending')) NOT NULL DEFAULT 'active';
    END IF;
    
    -- Check if the lastActive column already exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'lastActive'
    ) THEN
      -- Add the lastActive column
      ALTER TABLE "User" ADD COLUMN "lastActive" TIMESTAMP;
    END IF;
  END IF;
END $$;
