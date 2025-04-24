-- Set default role for all users that don't have a role
UPDATE "User" SET role = 'user' WHERE role IS NULL;

-- Set default status for all users that don't have a status
UPDATE "User" SET status = 'active' WHERE status IS NULL;
