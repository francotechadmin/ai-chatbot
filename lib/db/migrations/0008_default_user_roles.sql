-- Set default values for role and status columns with error handling
DO $$ 
BEGIN
  -- Check if the role column exists before trying to update it
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
  ) THEN
    -- Only run the update if the column exists
    UPDATE "User" SET role = 'user' WHERE role IS NULL;
  END IF;

  -- Check if the status column exists before trying to update it
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'status'
  ) THEN
    -- Only run the update if the column exists
    UPDATE "User" SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;
