import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcryptPkg from 'bcryptjs';
const bcrypt = bcryptPkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VoltNet database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voltnet.co.za' },
    update: {},
    create: {
      email: 'admin@voltnet.co.za',
      passwordHash: adminPassword,
      firstName: 'VoltNet',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology', description: 'Laptops, tablets, and computing devices', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'power-solutions' },
      update: {},
      create: { name: 'Power Solutions', slug: 'power-solutions', description: 'Inverters, batteries, UPS, and solar products', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'internet-networking' },
      update: {},
      create: { name: 'Internet & Networking', slug: 'internet-networking', description: 'Routers, switches, and networking equipment', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Cables, adapters, peripherals, and more', sortOrder: 4 },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  const [tech, power, networking, accessories] = categories;

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'refurbished-dell-latitude-5520' },
      update: {},
      create: {
        name: 'Refurbished Dell Latitude 5520', slug: 'refurbished-dell-latitude-5520',
        description: 'Intel Core i5-1145G7, 16GB RAM, 256GB SSD, 15.6" FHD. Professionally refurbished with 12-month warranty.',
        categoryId: tech.id, condition: 'REFURBISHED', costPrice: 4500, sellingPrice: 6999,
        stockQuantity: 15, supplierName: 'Scoop', sku: 'VN-TECH-001', isFeatured: true,
        images: { create: [{ url: '/images/products/dell-latitude-5520.jpg', altText: 'Dell Latitude 5520', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Best Value' }, { tag: 'Work From Home' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'lenovo-thinkpad-t14-gen3' },
      update: {},
      create: {
        name: 'Lenovo ThinkPad T14 Gen 3', slug: 'lenovo-thinkpad-t14-gen3',
        description: 'AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD, 14" FHD IPS. Business-grade reliability.',
        categoryId: tech.id, condition: 'NEW', costPrice: 8000, sellingPrice: 12499,
        stockQuantity: 8, supplierName: 'Scoop', sku: 'VN-TECH-002', isFeatured: true,
        images: { create: [{ url: '/images/products/thinkpad-t14.jpg', altText: 'Lenovo ThinkPad T14', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Premium' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'mecer-1200va-ups' },
      update: {},
      create: {
        name: 'Mecer 1200VA Line-Interactive UPS', slug: 'mecer-1200va-ups',
        description: '1200VA/720W UPS with AVR. Keeps your devices running during load shedding. 4x SA outlets.',
        categoryId: power.id, condition: 'NEW', costPrice: 1800, sellingPrice: 2699,
        stockQuantity: 25, supplierName: 'Scoop', sku: 'VN-PWR-001', isFeatured: true,
        images: { create: [{ url: '/images/products/mecer-ups.jpg', altText: 'Mecer 1200VA UPS', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Best Seller' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'must-3kw-hybrid-inverter' },
      update: {},
      create: {
        name: 'Must 3KW Hybrid Solar Inverter', slug: 'must-3kw-hybrid-inverter',
        description: '3000W hybrid inverter with MPPT charger. Compatible with lithium and lead-acid batteries.',
        categoryId: power.id, condition: 'NEW', costPrice: 5500, sellingPrice: 8499,
        stockQuantity: 10, sku: 'VN-PWR-002', isFeatured: true,
        images: { create: [{ url: '/images/products/must-inverter.jpg', altText: 'Must 3KW Inverter', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Solar' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'hubble-am2-51v-lithium-battery' },
      update: {},
      create: {
        name: 'Hubble AM-2 5.1kWh Lithium Battery', slug: 'hubble-am2-51v-lithium-battery',
        description: '5.12kWh lithium-ion battery. 6000+ cycle life, wall-mountable, BMS included.',
        categoryId: power.id, condition: 'NEW', costPrice: 12000, sellingPrice: 16999,
        stockQuantity: 6, sku: 'VN-PWR-003',
        images: { create: [{ url: '/images/products/hubble-battery.jpg', altText: 'Hubble AM-2 Battery', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Premium' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'mikrotik-hap-ac3' },
      update: {},
      create: {
        name: 'MikroTik hAP ac3 Router', slug: 'mikrotik-hap-ac3',
        description: 'Dual-band WiFi 5 router, 5x Gigabit ports, USB 3.0. Professional-grade networking.',
        categoryId: networking.id, condition: 'NEW', costPrice: 1500, sellingPrice: 2299,
        stockQuantity: 20, supplierName: 'Scoop', sku: 'VN-NET-001', isFeatured: true,
        images: { create: [{ url: '/images/products/mikrotik-hap.jpg', altText: 'MikroTik hAP ac3', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Best Seller' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ubiquiti-unifi-u6-lite' },
      update: {},
      create: {
        name: 'Ubiquiti UniFi U6 Lite Access Point', slug: 'ubiquiti-unifi-u6-lite',
        description: 'WiFi 6 access point, PoE powered, 1500+ sq ft coverage. Enterprise-grade.',
        categoryId: networking.id, condition: 'NEW', costPrice: 1400, sellingPrice: 2199,
        stockQuantity: 12, sku: 'VN-NET-002',
        images: { create: [{ url: '/images/products/unifi-u6.jpg', altText: 'UniFi U6 Lite', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Premium' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'cat6-network-cable-305m' },
      update: {},
      create: {
        name: 'CAT6 Network Cable 305m Box', slug: 'cat6-network-cable-305m',
        description: 'CAT6 UTP network cable, 305m box. Pure copper, suitable for Gigabit networks.',
        categoryId: accessories.id, condition: 'NEW', costPrice: 800, sellingPrice: 1299,
        stockQuantity: 30, sku: 'VN-ACC-001',
        images: { create: [{ url: '/images/products/cat6-cable.jpg', altText: 'CAT6 Cable Box', isPrimary: true, sortOrder: 0 }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'logitech-mk270-wireless-combo' },
      update: {},
      create: {
        name: 'Logitech MK270 Wireless Keyboard & Mouse', slug: 'logitech-mk270-wireless-combo',
        description: 'Wireless keyboard and mouse combo. 2.4GHz connection, long battery life.',
        categoryId: accessories.id, condition: 'NEW', costPrice: 350, sellingPrice: 599,
        stockQuantity: 40, sku: 'VN-ACC-002', isFeatured: true,
        images: { create: [{ url: '/images/products/logitech-mk270.jpg', altText: 'Logitech MK270', isPrimary: true, sortOrder: 0 }] },
        tags: { create: [{ tag: 'Best Value' }] },
      },
    }),
  ]);
  console.log('✅ Products created:', products.length);

  const bundles = await Promise.all([
    prisma.bundle.upsert({
      where: { slug: 'work-from-home-kit' },
      update: {},
      create: {
        name: 'Work From Home Kit', slug: 'work-from-home-kit',
        description: 'Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals.',
        bundlePrice: 9499, isFeatured: true,
        items: { create: [
          { productId: products[0].id, quantity: 1 },
          { productId: products[2].id, quantity: 1 },
          { productId: products[8].id, quantity: 1 },
        ]},
      },
    }),
    prisma.bundle.upsert({
      where: { slug: 'load-shedding-backup-kit' },
      update: {},
      create: {
        name: 'Load Shedding Backup Kit', slug: 'load-shedding-backup-kit',
        description: 'Beat load shedding with a powerful inverter and lithium battery combo.',
        bundlePrice: 23999, isFeatured: true,
        items: { create: [
          { productId: products[3].id, quantity: 1 },
          { productId: products[4].id, quantity: 1 },
        ]},
      },
    }),
    prisma.bundle.upsert({
      where: { slug: 'small-business-network-kit' },
      update: {},
      create: {
        name: 'Small Business Network Kit', slug: 'small-business-network-kit',
        description: 'Professional networking setup for small businesses — router, access point, and bulk cabling.',
        bundlePrice: 4999, isFeatured: true,
        items: { create: [
          { productId: products[5].id, quantity: 1 },
          { productId: products[6].id, quantity: 1 },
          { productId: products[7].id, quantity: 1 },
        ]},
      },
    }),
  ]);
  console.log('✅ Bundles created:', bundles.length);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error('Seeding error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
