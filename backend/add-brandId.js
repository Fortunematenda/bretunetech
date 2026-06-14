const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addBrandId() {
  try {
    await pool.query('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brandId" TEXT');
    console.log('Added brandId column to products table');
    
    // Check if constraint exists before adding
    const constraintCheck = await pool.query(`
      SELECT COUNT(*) FROM pg_constraint 
      WHERE conname = 'products_brandId_fkey'
    `);
    if (parseInt(constraintCheck.rows[0].count) === 0) {
      await pool.query(`
        ALTER TABLE "products" 
        ADD CONSTRAINT "products_brandId_fkey" 
        FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('Added foreign key constraint');
    } else {
      console.log('Foreign key constraint already exists');
    }
    
    await pool.query('CREATE INDEX IF NOT EXISTS "products_brandId_idx" ON "products"("brandId")');
    console.log('Added index on brandId');
    
    console.log('brandId column added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addBrandId();
