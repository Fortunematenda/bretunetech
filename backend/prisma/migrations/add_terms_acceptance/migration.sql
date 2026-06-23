-- Add terms acceptance fields to users table
ALTER TABLE "users" ADD COLUMN "acceptedTerms" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "termsAcceptedAt" TIMESTAMP;
