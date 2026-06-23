import prisma from '../src/lib/prisma';

async function runMigration() {
  console.log('Running manual migration for permissions tables...');
  
  try {
    // Create permissions table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "permissions" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Created permissions table');

    // Create unique index on permissions.name
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name")
    `);
    console.log('✅ Created unique index on permissions.name');

    // Create role_permissions table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
          "id" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "permissionId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Created role_permissions table');

    // Create unique index on role_permissions (role, permissionId)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_permissionId_key" ON "role_permissions"("role", "permissionId")
    `);
    console.log('✅ Created unique index on role_permissions (role, permissionId)');

    // Create indexes for role_permissions
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "role_permissions_role_idx" ON "role_permissions"("role")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "role_permissions_permissionId_idx" ON "role_permissions"("permissionId")
    `);
    console.log('✅ Created indexes for role_permissions');

    // Add foreign key constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" 
          FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ Added foreign key constraint');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
