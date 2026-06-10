-- Add maintenance mode fields to business_settings table
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "maintenanceMode" BOOLEAN DEFAULT false;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "maintenanceMessage" TEXT;
