import dotenv from 'dotenv';
dotenv.config();

import prisma from './lib/prisma';

const defaultPermissions = [
  // Products
  { name: 'products.view', description: 'View products', category: 'Products' },
  { name: 'products.create', description: 'Create products', category: 'Products' },
  { name: 'products.edit', description: 'Edit products', category: 'Products' },
  { name: 'products.delete', description: 'Delete products', category: 'Products' },
  
  // Categories
  { name: 'categories.view', description: 'View categories', category: 'Catalog' },
  { name: 'categories.create', description: 'Create categories', category: 'Catalog' },
  { name: 'categories.edit', description: 'Edit categories', category: 'Catalog' },
  { name: 'categories.delete', description: 'Delete categories', category: 'Catalog' },
  
  // Brands
  { name: 'brands.view', description: 'View brands', category: 'Catalog' },
  { name: 'brands.create', description: 'Create brands', category: 'Catalog' },
  { name: 'brands.edit', description: 'Edit brands', category: 'Catalog' },
  { name: 'brands.delete', description: 'Delete brands', category: 'Catalog' },
  
  // Orders
  { name: 'orders.view', description: 'View orders', category: 'Orders' },
  { name: 'orders.create', description: 'Create orders', category: 'Orders' },
  { name: 'orders.edit', description: 'Edit orders', category: 'Orders' },
  { name: 'orders.delete', description: 'Delete orders', category: 'Orders' },
  { name: 'orders.update_status', description: 'Update order status', category: 'Orders' },
  
  // Customers
  { name: 'customers.view', description: 'View customers', category: 'Customers' },
  { name: 'customers.create', description: 'Create customers', category: 'Customers' },
  { name: 'customers.edit', description: 'Edit customers', category: 'Customers' },
  { name: 'customers.delete', description: 'Delete customers', category: 'Customers' },
  
  // Admin Users
  { name: 'admin_users.view', description: 'View admin users', category: 'Admin' },
  { name: 'admin_users.create', description: 'Create admin users', category: 'Admin' },
  { name: 'admin_users.edit', description: 'Edit admin users', category: 'Admin' },
  { name: 'admin_users.delete', description: 'Delete admin users', category: 'Admin' },
  { name: 'admin_users.manage_roles', description: 'Manage roles and permissions', category: 'Admin' },
  
  // Analytics
  { name: 'analytics.view', description: 'View analytics', category: 'Analytics' },
  { name: 'analytics.visitors', description: 'View visitor analytics', category: 'Analytics' },
  
  // Settings
  { name: 'settings.view', description: 'View settings', category: 'Settings' },
  { name: 'settings.edit', description: 'Edit settings', category: 'Settings' },
  { name: 'settings.business', description: 'Manage business settings', category: 'Settings' },
  { name: 'settings.shipping', description: 'Manage shipping settings', category: 'Settings' },
  
  // Enquiries
  { name: 'enquiries.view', description: 'View enquiries', category: 'Sales' },
  { name: 'enquiries.delete', description: 'Delete enquiries', category: 'Sales' },
  
  // Bookings
  { name: 'bookings.view', description: 'View service bookings', category: 'Sales' },
  { name: 'bookings.edit', description: 'Edit service bookings', category: 'Sales' },
  { name: 'bookings.delete', description: 'Delete service bookings', category: 'Sales' },
  
  // Invoices
  { name: 'invoices.view', description: 'View invoices', category: 'Sales' },
  { name: 'invoices.create', description: 'Create invoices', category: 'Sales' },
  { name: 'invoices.edit', description: 'Edit invoices', category: 'Sales' },
  { name: 'invoices.delete', description: 'Delete invoices', category: 'Sales' },
  
  // Returns
  { name: 'returns.view', description: 'View returns', category: 'Sales' },
  { name: 'returns.approve', description: 'Approve returns', category: 'Sales' },
  { name: 'returns.reject', description: 'Reject returns', category: 'Sales' },
  
  // Suppliers
  { name: 'suppliers.view', description: 'View suppliers', category: 'Inventory' },
  { name: 'suppliers.create', description: 'Create suppliers', category: 'Inventory' },
  { name: 'suppliers.edit', description: 'Edit suppliers', category: 'Inventory' },
  { name: 'suppliers.delete', description: 'Delete suppliers', category: 'Inventory' },
  
  // Bundles
  { name: 'bundles.view', description: 'View bundles', category: 'Catalog' },
  { name: 'bundles.create', description: 'Create bundles', category: 'Catalog' },
  { name: 'bundles.edit', description: 'Edit bundles', category: 'Catalog' },
  { name: 'bundles.delete', description: 'Delete bundles', category: 'Catalog' },
  
  // Marketing
  { name: 'marketing.view', description: 'View marketing settings', category: 'Marketing' },
  { name: 'marketing.edit', description: 'Edit marketing settings', category: 'Marketing' },
  { name: 'marketing.ads', description: 'Manage ads and banners', category: 'Marketing' },
  { name: 'marketing.hero', description: 'Manage hero settings', category: 'Marketing' },
];

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  
  // Create permissions
  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  
  console.log('✅ Permissions seeded successfully');
  
  // Assign all permissions to SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: 'SUPER_ADMIN',
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        role: 'SUPER_ADMIN',
        permissionId: perm.id,
      },
    });
  }
  
  console.log('✅ SUPER_ADMIN granted all permissions');
  
  // Assign basic permissions to ADMIN
  const adminPermissions = [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
    'brands.view', 'brands.create', 'brands.edit', 'brands.delete',
    'orders.view', 'orders.edit', 'orders.update_status',
    'customers.view', 'customers.edit',
    'analytics.view', 'analytics.visitors',
    'settings.view', 'settings.edit',
    'enquiries.view', 'enquiries.delete',
    'bookings.view', 'bookings.edit',
    'invoices.view', 'invoices.create',
    'returns.view', 'returns.approve',
    'suppliers.view', 'suppliers.create', 'suppliers.edit',
    'bundles.view', 'bundles.create', 'bundles.edit',
    'marketing.view', 'marketing.edit', 'marketing.ads', 'marketing.hero',
  ];
  
  for (const permName of adminPermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: 'ADMIN',
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          role: 'ADMIN',
          permissionId: perm.id,
        },
      });
    }
  }
  
  console.log('✅ ADMIN granted basic permissions');
  
  // Assign limited permissions to STAFF
  const staffPermissions = [
    'products.view',
    'orders.view', 'orders.update_status',
    'customers.view',
    'analytics.view',
    'enquiries.view',
    'bookings.view',
    'suppliers.view',
  ];
  
  for (const permName of staffPermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: 'STAFF',
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          role: 'STAFF',
          permissionId: perm.id,
        },
      });
    }
  }
  
  console.log('✅ STAFF granted limited permissions');
  
  // Assign vendor permissions
  const vendorPermissions = [
    'products.view',
    'orders.view',
    'suppliers.view',
  ];
  
  for (const permName of vendorPermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: 'VENDOR',
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          role: 'VENDOR',
          permissionId: perm.id,
        },
      });
    }
  }
  
  console.log('✅ VENDOR granted limited permissions');
  console.log('🎉 Permission seeding complete!');
}

seedPermissions()
  .catch((e) => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
