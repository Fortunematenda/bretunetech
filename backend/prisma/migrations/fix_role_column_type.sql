-- Fix role column type in role_permissions table to match Role enum
ALTER TABLE "role_permissions" 
ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;

-- Note: We're keeping it as TEXT since the enum might not be properly set up
-- This allows the seed script to work with string values
