-- Add brandId column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brandId" TEXT;

-- Add foreign key constraint to brands table
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" 
FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index on brandId
CREATE INDEX IF NOT EXISTS "products_brandId_idx" ON "products"("brandId");
