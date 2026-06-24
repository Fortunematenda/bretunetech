-- Create custom_roles table
CREATE TABLE IF NOT EXISTS "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- Create unique index on custom_roles.name
CREATE UNIQUE INDEX IF NOT EXISTS "custom_roles_name_key" ON "custom_roles"("name");

-- Create custom_role_permissions table
CREATE TABLE IF NOT EXISTS "custom_role_permissions" (
    "id" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_role_permissions_pkey" PRIMARY KEY ("id")
);

-- Create unique index on custom_role_permissions (customRoleId, permissionId)
CREATE UNIQUE INDEX IF NOT EXISTS "custom_role_permissions_customRoleId_permissionId_key" ON "custom_role_permissions"("customRoleId", "permissionId");

-- Create indexes for custom_role_permissions
CREATE INDEX IF NOT EXISTS "custom_role_permissions_customRoleId_idx" ON "custom_role_permissions"("customRoleId");
CREATE INDEX IF NOT EXISTS "custom_role_permissions_permissionId_idx" ON "custom_role_permissions"("permissionId");

-- Add foreign key constraints
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_customRoleId_fkey" 
    FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_permissionId_fkey" 
    FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add customRoleId column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'customRoleId'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "customRoleId" TEXT;
        CREATE INDEX IF NOT EXISTS "users_customRoleId_idx" ON "users"("customRoleId");
        ALTER TABLE "users" ADD CONSTRAINT "users_customRoleId_fkey" 
            FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
