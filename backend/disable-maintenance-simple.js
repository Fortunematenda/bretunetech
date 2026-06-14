const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function disableMaintenance() {
  try {
    await pool.query('UPDATE "business_settings" SET "maintenanceMode" = false WHERE id IS NOT NULL');
    console.log('Maintenance mode disabled successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

disableMaintenance();
