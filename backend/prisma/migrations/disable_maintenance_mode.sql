-- Disable maintenance mode
UPDATE "business_settings" SET "maintenanceMode" = false WHERE id IS NOT NULL;
