-- Add role, status, and lastActive columns to User table with error handling
DO $$ 
BEGIN
  -- Only add the columns if they don't already exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "role" VARCHAR(10) NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'status'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "status" VARCHAR(10) NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'lastActive'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lastActive" TIMESTAMP;
  END IF;
END $$;
