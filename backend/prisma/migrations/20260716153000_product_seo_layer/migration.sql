ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "seoTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "metaDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "supplierTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "supplierDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "supplierSpecifications" TEXT,
  ADD COLUMN IF NOT EXISTS "supplierSku" TEXT,
  ADD COLUMN IF NOT EXISTS "displayName" TEXT,
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "fullDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "seoTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "secondaryKeywords" TEXT,
  ADD COLUMN IF NOT EXISTS "imageAltText" TEXT,
  ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "seoGeneratedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "seoContentVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "seoLocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "discontinued" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "replacementProductId" TEXT;

CREATE TABLE IF NOT EXISTS "product_redirects" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "oldSlug" TEXT NOT NULL,
  "newSlug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_redirects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_redirects_oldSlug_key" ON "product_redirects"("oldSlug");
CREATE INDEX IF NOT EXISTS "product_redirects_productId_idx" ON "product_redirects"("productId");

DO $$ BEGIN
  ALTER TABLE "product_redirects"
    ADD CONSTRAINT "product_redirects_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE "products"
SET
  "supplierTitle" = COALESCE("supplierTitle", "name"),
  "supplierDescription" = COALESCE("supplierDescription", "description"),
  "supplierSku" = COALESCE("supplierSku", "sku"),
  "displayName" = COALESCE("displayName", "name"),
  "shortDescription" = COALESCE("shortDescription", "description"),
  "fullDescription" = COALESCE("fullDescription", "description"),
  "seoTitle" = COALESCE("seoTitle", "name"),
  "canonicalUrl" = COALESCE("canonicalUrl", 'https://bretunetech.com/products/' || "slug")
WHERE "supplierTitle" IS NULL
   OR "supplierDescription" IS NULL
   OR "supplierSku" IS NULL
   OR "displayName" IS NULL
   OR "shortDescription" IS NULL
   OR "fullDescription" IS NULL
   OR "seoTitle" IS NULL
   OR "canonicalUrl" IS NULL;

UPDATE "categories"
SET "canonicalUrl" = COALESCE("canonicalUrl", 'https://bretunetech.com/products?category=' || "slug")
WHERE "canonicalUrl" IS NULL;
