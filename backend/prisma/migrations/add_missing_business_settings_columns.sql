-- Add missing columns to business_settings table
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "legalName" TEXT DEFAULT 'Bretune Technologies (Pty) Ltd';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT DEFAULT '2025/545182/07';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "taxNumber" TEXT DEFAULT '9276141273';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "website" TEXT DEFAULT 'https://bretunetech.com';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "supportEmail" TEXT DEFAULT 'support@bretunetech.com';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'South Africa';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "businessType" TEXT DEFAULT 'Technology Ecommerce & Solutions Provider';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "accountHolder" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "branchCode" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "accountType" TEXT DEFAULT 'Current';
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "showLegalInfo" BOOLEAN DEFAULT true;
