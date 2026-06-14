const fetch = require('node-fetch');

require('dotenv').config();

async function disableMaintenance() {
  try {
    // First, login as admin to get a token
    const loginResponse = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@bretunetech.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const { token } = await loginResponse.json();

    // Get current settings
    const settingsResponse = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/admin/business-settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!settingsResponse.ok) {
      throw new Error('Failed to get settings');
    }

    const settings = await settingsResponse.json();

    // Update settings to disable maintenance mode
    const updateResponse = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/admin/business-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...settings,
        maintenanceMode: false
      })
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update settings');
    }

    console.log('Maintenance mode disabled successfully via API');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

disableMaintenance();
