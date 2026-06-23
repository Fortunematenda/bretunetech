import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding VoltNet database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Rachfort24', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bretunetech.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@bretunetech.com',
      passwordHash: adminPassword,
      firstName: 'Bretunetech',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isVerified: true,
      acceptedTerms: true,
      termsAcceptedAt: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: { imageUrl: '/assets/brands/mikrotik.svg' },
      create: { name: 'Technology', slug: 'technology', description: 'Laptops, tablets, and computing devices', sortOrder: 1, imageUrl: '/assets/brands/mikrotik.svg' },
    }),
    prisma.category.upsert({
      where: { slug: 'power-solutions' },
      update: { imageUrl: '/assets/brands/must.svg' },
      create: { name: 'Power Solutions', slug: 'power-solutions', description: 'Inverters, batteries, UPS, and solar products', sortOrder: 2, imageUrl: '/assets/brands/must.svg' },
    }),
    prisma.category.upsert({
      where: { slug: 'internet-networking' },
      update: { imageUrl: '/assets/brands/ubiquiti.png' },
      create: { name: 'Internet & Networking', slug: 'internet-networking', description: 'Routers, switches, and networking equipment', sortOrder: 3, imageUrl: '/assets/brands/ubiquiti.png' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories', description: 'Cables, adapters, peripherals, and more', sortOrder: 4 },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  const [tech, power, networking, accessories] = categories;

  // Create products
  const products = await Promise.all([
    // Technology
    prisma.product.upsert({
      where: { slug: 'refurbished-dell-latitude-5520' },
      update: {},
      create: {
        name: 'Refurbished Dell Latitude 5520',
        slug: 'refurbished-dell-latitude-5520',
        description: 'Intel Core i5-1145G7, 16GB RAM, 256GB SSD, 15.6" FHD. Professionally refurbished with 12-month warranty.',
        categoryId: tech.id,
        condition: 'REFURBISHED',
        costPrice: 4500,
        sellingPrice: 6999,
        stockQuantity: 15,
        supplierName: 'Scoop',
        sku: 'VN-TECH-001',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/Refurbished-Dell-Latitude-5520-p1.jfif', altText: 'Dell Latitude 5520', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Refurbished-Dell-Latitude-5520-p2.jfif', altText: 'Dell Latitude 5520 - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Refurbished-Dell-Latitude-5520-p3.jfif', altText: 'Dell Latitude 5520 - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Best Value' }, { tag: 'Work From Home' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'lenovo-thinkpad-t14-gen3' },
      update: {},
      create: {
        name: 'Lenovo ThinkPad T14 Gen 3',
        slug: 'lenovo-thinkpad-t14-gen3',
        description: 'AMD Ryzen 5 PRO, 16GB RAM, 512GB SSD, 14" FHD IPS. Business-grade reliability.',
        categoryId: tech.id,
        condition: 'NEW',
        costPrice: 8000,
        sellingPrice: 12499,
        stockQuantity: 8,
        supplierName: 'Scoop',
        sku: 'VN-TECH-002',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-1.jfif', altText: 'Lenovo ThinkPad T14 Gen 3', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-2.jfif', altText: 'Lenovo ThinkPad T14 Gen 3 - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Lenovo-ThinkPad-T14-Gen-3-3.jfif', altText: 'Lenovo ThinkPad T14 Gen 3 - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Premium' }] },
      },
    }),

    // Power Solutions
    prisma.product.upsert({
      where: { slug: 'mecer-1200va-ups' },
      update: {},
      create: {
        name: 'Mecer 1200VA Line-Interactive UPS',
        slug: 'mecer-1200va-ups',
        description: '1200VA/720W UPS with AVR. Keeps your devices running during load shedding. 4x SA outlets.',
        categoryId: power.id,
        condition: 'NEW',
        costPrice: 1800,
        sellingPrice: 2699,
        stockQuantity: 25,
        supplierName: 'Scoop',
        sku: 'VN-PWR-001',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/Mecer-1200VA-UPS-1.jfif', altText: 'Mecer 1200VA UPS', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Mecer-1200VA-UPS-2.jfif', altText: 'Mecer 1200VA UPS - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Mecer-1200VA-UPS-3.jfif', altText: 'Mecer 1200VA UPS - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Best Seller' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'must-3kw-hybrid-inverter' },
      update: {},
      create: {
        name: 'Must 3KW Hybrid Solar Inverter',
        slug: 'must-3kw-hybrid-inverter',
        description: '3000W hybrid inverter with MPPT charger. Compatible with lithium and lead-acid batteries.',
        categoryId: power.id,
        condition: 'NEW',
        costPrice: 5500,
        sellingPrice: 8499,
        stockQuantity: 10,
        sku: 'VN-PWR-002',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter1.jfif', altText: 'Must 3KW Hybrid Inverter', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter2.jfif', altText: 'Must 3KW Hybrid Inverter - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Must-3KW-Hybrid-Solar-Inverter3.jfif', altText: 'Must 3KW Hybrid Inverter - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Solar' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'hubble-am2-51v-lithium-battery' },
      update: {},
      create: {
        name: 'Hubble AM-2 5.1kWh Lithium Battery',
        slug: 'hubble-am2-51v-lithium-battery',
        description: '5.12kWh lithium-ion battery. 6000+ cycle life, wall-mountable, BMS included.',
        categoryId: power.id,
        condition: 'NEW',
        costPrice: 12000,
        sellingPrice: 16999,
        stockQuantity: 6,
        sku: 'VN-PWR-003',
        images: {
          create: [
            { url: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery1.jfif', altText: 'Hubble AM-2 Lithium Battery', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery2.jfif', altText: 'Hubble AM-2 Lithium Battery - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Hubble-AM-2-5.1kWh-Lithium-Battery3.jfif', altText: 'Hubble AM-2 Lithium Battery - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Load Shedding Ready' }, { tag: 'Premium' }] },
      },
    }),

    // Networking
    prisma.product.upsert({
      where: { slug: 'mikrotik-hap-ac3' },
      update: {},
      create: {
        name: 'MikroTik hAP ac3 Router',
        slug: 'mikrotik-hap-ac3',
        description: 'Dual-band WiFi 5 router, 5x Gigabit ports, USB 3.0. Professional-grade networking.',
        categoryId: networking.id,
        condition: 'NEW',
        costPrice: 1500,
        sellingPrice: 2299,
        stockQuantity: 20,
        supplierName: 'Scoop',
        sku: 'VN-NET-001',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/MikroTik-hAP-ac3-Router.jfif', altText: 'MikroTik hAP ac3 Router', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/MikroTik-hAP-ac3-Router2.jfif', altText: 'MikroTik hAP ac3 Router - 2', isPrimary: false, sortOrder: 1 },
          ],
        },
        tags: { create: [{ tag: 'Best Seller' }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ubiquiti-unifi-u6-lite' },
      update: {},
      create: {
        name: 'Ubiquiti UniFi U6 Lite Access Point',
        slug: 'ubiquiti-unifi-u6-lite',
        description: 'WiFi 6 access point, PoE powered, 1500+ sq ft coverage. Enterprise-grade.',
        categoryId: networking.id,
        condition: 'NEW',
        costPrice: 1400,
        sellingPrice: 2199,
        stockQuantity: 12,
        sku: 'VN-NET-002',
        images: {
          create: [
            { url: '/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP1.jfif', altText: 'Ubiquiti UniFi U6 Lite', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP2.jfif', altText: 'Ubiquiti UniFi U6 Lite - 2', isPrimary: false, sortOrder: 1 },
            { url: '/assets/products-pics/Ubiquiti-UniFi-U6-Lite-AP3.jfif', altText: 'Ubiquiti UniFi U6 Lite - 3', isPrimary: false, sortOrder: 2 },
          ],
        },
        tags: { create: [{ tag: 'Premium' }] },
      },
    }),

    // Accessories
    prisma.product.upsert({
      where: { slug: 'cat6-network-cable-305m' },
      update: {},
      create: {
        name: 'CAT6 Network Cable 305m Box',
        slug: 'cat6-network-cable-305m',
        description: 'CAT6 UTP network cable, 305m box. Pure copper, suitable for Gigabit networks.',
        categoryId: accessories.id,
        condition: 'NEW',
        costPrice: 800,
        sellingPrice: 1299,
        stockQuantity: 30,
        sku: 'VN-ACC-001',
        images: {
          create: [
            { url: '/assets/products-pics/CAT6-Network-Cable-305m.jfif', altText: 'CAT6 Network Cable 305m', isPrimary: true, sortOrder: 0 },
            { url: '/assets/products-pics/CAT6-Network-Cable-305m2.jfif', altText: 'CAT6 Network Cable 305m - 2', isPrimary: false, sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'logitech-mk270-wireless-combo' },
      update: {},
      create: {
        name: 'Logitech MK270 Wireless Keyboard & Mouse',
        slug: 'logitech-mk270-wireless-combo',
        description: 'Wireless keyboard and mouse combo. 2.4GHz connection, long battery life.',
        categoryId: accessories.id,
        condition: 'NEW',
        costPrice: 350,
        sellingPrice: 599,
        stockQuantity: 40,
        sku: 'VN-ACC-002',
        isFeatured: true,
        images: {
          create: [
            { url: '/assets/products-pics/voltnet-logo.jfif', altText: 'Logitech MK270 Wireless Combo', isPrimary: true, sortOrder: 0 },
          ],
        },
        tags: { create: [{ tag: 'Best Value' }] },
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // Create bundles
  const bundles = await Promise.all([
    prisma.bundle.upsert({
      where: { slug: 'work-from-home-kit' },
      update: {},
      create: {
        name: 'Work From Home Kit',
        slug: 'work-from-home-kit',
        description: 'Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals.',
        bundlePrice: 9499,
        isFeatured: true,
        items: {
          create: [
            { productId: products[0].id, quantity: 1 }, // Dell laptop
            { productId: products[2].id, quantity: 1 }, // Mecer UPS
            { productId: products[8].id, quantity: 1 }, // Logitech combo
          ],
        },
      },
    }),
    prisma.bundle.upsert({
      where: { slug: 'load-shedding-backup-kit' },
      update: {},
      create: {
        name: 'Load Shedding Backup Kit',
        slug: 'load-shedding-backup-kit',
        description: 'Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running.',
        bundlePrice: 23999,
        isFeatured: true,
        items: {
          create: [
            { productId: products[3].id, quantity: 1 }, // Must inverter
            { productId: products[4].id, quantity: 1 }, // Hubble battery
          ],
        },
      },
    }),
    prisma.bundle.upsert({
      where: { slug: 'small-business-network-kit' },
      update: {},
      create: {
        name: 'Small Business Network Kit',
        slug: 'small-business-network-kit',
        description: 'Professional networking setup for small businesses — router, access point, and bulk cabling.',
        bundlePrice: 4999,
        isFeatured: true,
        items: {
          create: [
            { productId: products[5].id, quantity: 1 }, // MikroTik router
            { productId: products[6].id, quantity: 1 }, // UniFi AP
            { productId: products[7].id, quantity: 1 }, // CAT6 cable
          ],
        },
      },
    }),
  ]);

  console.log('✅ Bundles created:', bundles.length);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
