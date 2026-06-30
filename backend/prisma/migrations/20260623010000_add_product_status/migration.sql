-- CreateEnum (safe)
DO $$ BEGIN
  CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable (safe)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';
