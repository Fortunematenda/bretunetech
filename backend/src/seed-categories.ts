import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categoryStructure = [
  {
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    description: 'Laptops, desktop PCs, mini PCs, and all-in-one computers for work and home.',
    sortOrder: 1,
    subcategories: [
      { name: 'Laptops', slug: 'laptops', sortOrder: 1 },
      { name: 'Desktop PCs', slug: 'desktop-pcs', sortOrder: 2 },
      { name: 'Mini PCs', slug: 'mini-pcs', sortOrder: 3 },
      { name: 'All-in-One PCs', slug: 'all-in-one-pcs', sortOrder: 4 },
    ],
  },
  {
    name: 'Computer Components',
    slug: 'computer-components',
    description: 'Motherboards, processors, graphics cards, RAM, and PC building components.',
    sortOrder: 2,
    subcategories: [
      { name: 'Motherboards', slug: 'motherboards', sortOrder: 1 },
      { name: 'Processors (CPUs)', slug: 'processors-cpus', sortOrder: 2 },
      { name: 'Graphics Cards (GPUs)', slug: 'graphics-cards-gpus', sortOrder: 3 },
      { name: 'RAM', slug: 'ram', sortOrder: 4 },
      { name: 'Power Supplies (PSUs)', slug: 'power-supplies-psus', sortOrder: 5 },
      { name: 'PC Cases', slug: 'pc-cases', sortOrder: 6 },
      { name: 'Cooling', slug: 'cooling', sortOrder: 7 },
      { name: 'Fans', slug: 'fans', sortOrder: 8 },
      { name: 'Thermal Paste', slug: 'thermal-paste', sortOrder: 9 },
    ],
  },
  {
    name: 'Storage & Memory',
    slug: 'storage-memory',
    description: 'SSDs, hard drives, external storage, and memory cards.',
    sortOrder: 3,
    subcategories: [
      { name: 'SSDs', slug: 'ssds', sortOrder: 1 },
      { name: 'Hard Drives', slug: 'hard-drives', sortOrder: 2 },
      { name: 'External Storage', slug: 'external-storage', sortOrder: 3 },
      { name: 'USB Flash Drives', slug: 'usb-flash-drives', sortOrder: 4 },
      { name: 'Memory Cards', slug: 'memory-cards', sortOrder: 5 },
      { name: 'NAS Storage', slug: 'nas-storage', sortOrder: 6 },
    ],
  },
  {
    name: 'Networking',
    slug: 'networking',
    description: 'Routers, switches, mesh WiFi, and network infrastructure equipment.',
    sortOrder: 4,
    subcategories: [
      { name: 'Routers', slug: 'routers', sortOrder: 1 },
      { name: 'Mesh WiFi Systems', slug: 'mesh-wifi-systems', sortOrder: 2 },
      { name: 'Access Points', slug: 'access-points', sortOrder: 3 },
      { name: 'Network Switches', slug: 'network-switches', sortOrder: 4 },
      { name: 'Network Cables', slug: 'network-cables', sortOrder: 5 },
      { name: 'Fibre Equipment', slug: 'fibre-equipment', sortOrder: 6 },
      { name: 'Network Cabinets', slug: 'network-cabinets', sortOrder: 7 },
      { name: 'PoE Equipment', slug: 'poe-equipment', sortOrder: 8 },
    ],
  },
  {
    name: 'CCTV & Security',
    slug: 'cctv-security',
    description: 'Security cameras, NVRs, access control, and alarm systems.',
    sortOrder: 5,
    subcategories: [
      { name: 'CCTV Cameras', slug: 'cctv-cameras', sortOrder: 1 },
      { name: 'NVRs & DVRs', slug: 'nvrs-dvrs', sortOrder: 2 },
      { name: 'Video Doorbells', slug: 'video-doorbells', sortOrder: 3 },
      { name: 'Access Control', slug: 'access-control', sortOrder: 4 },
      { name: 'Alarm Systems', slug: 'alarm-systems', sortOrder: 5 },
      { name: 'Intercom Systems', slug: 'intercom-systems', sortOrder: 6 },
    ],
  },
  {
    name: 'Power & Backup',
    slug: 'power-backup',
    description: 'UPS systems, inverters, batteries, and solar power solutions.',
    sortOrder: 6,
    subcategories: [
      { name: 'UPS Systems', slug: 'ups-systems', sortOrder: 1 },
      { name: 'Inverters', slug: 'inverters', sortOrder: 2 },
      { name: 'Batteries', slug: 'batteries', sortOrder: 3 },
      { name: 'Surge Protectors', slug: 'surge-protectors', sortOrder: 4 },
      { name: 'Solar Accessories', slug: 'solar-accessories', sortOrder: 5 },
      { name: 'Power Distribution Units (PDUs)', slug: 'power-distribution-units', sortOrder: 6 },
    ],
  },
  {
    name: 'Wireless Solutions',
    slug: 'wireless-solutions',
    description: 'Outdoor wireless, point-to-point links, and WiFi extenders.',
    sortOrder: 7,
    subcategories: [
      { name: 'Outdoor Wireless', slug: 'outdoor-wireless', sortOrder: 1 },
      { name: 'Point-to-Point Links', slug: 'point-to-point-links', sortOrder: 2 },
      { name: 'WiFi Extenders', slug: 'wifi-extenders', sortOrder: 3 },
      { name: 'Wireless Bridges', slug: 'wireless-bridges', sortOrder: 4 },
      { name: 'Antennas', slug: 'antennas', sortOrder: 5 },
    ],
  },
  {
    name: 'Printers & Office',
    slug: 'printers-office',
    description: 'Printers, scanners, ink, toners, and office equipment.',
    sortOrder: 8,
    subcategories: [
      { name: 'Printers', slug: 'printers', sortOrder: 1 },
      { name: 'Scanners', slug: 'scanners', sortOrder: 2 },
      { name: 'Ink', slug: 'ink', sortOrder: 3 },
      { name: 'Toners', slug: 'toners', sortOrder: 4 },
      { name: 'Label Printers', slug: 'label-printers', sortOrder: 5 },
      { name: 'Office Equipment', slug: 'office-equipment', sortOrder: 6 },
    ],
  },
  {
    name: 'Peripherals',
    slug: 'peripherals',
    description: 'Monitors, keyboards, mice, webcams, and computer accessories.',
    sortOrder: 9,
    subcategories: [
      { name: 'Monitors', slug: 'monitors', sortOrder: 1 },
      { name: 'Keyboards', slug: 'keyboards', sortOrder: 2 },
      { name: 'Mice', slug: 'mice', sortOrder: 3 },
      { name: 'Webcams', slug: 'webcams', sortOrder: 4 },
      { name: 'Speakers', slug: 'speakers', sortOrder: 5 },
      { name: 'Headsets', slug: 'headsets', sortOrder: 6 },
      { name: 'Docking Stations', slug: 'docking-stations', sortOrder: 7 },
    ],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Gaming keyboards, mice, monitors, chairs, and gaming accessories.',
    sortOrder: 10,
    subcategories: [
      { name: 'Gaming Keyboards', slug: 'gaming-keyboards', sortOrder: 1 },
      { name: 'Gaming Mice', slug: 'gaming-mice', sortOrder: 2 },
      { name: 'Gaming Monitors', slug: 'gaming-monitors', sortOrder: 3 },
      { name: 'Gaming Chairs', slug: 'gaming-chairs', sortOrder: 4 },
      { name: 'Gaming Accessories', slug: 'gaming-accessories', sortOrder: 5 },
    ],
  },
  {
    name: 'Mobile & Smart Devices',
    slug: 'mobile-smart-devices',
    description: 'Smartphones, tablets, smart watches, and smart home devices.',
    sortOrder: 11,
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones', sortOrder: 1 },
      { name: 'Tablets', slug: 'tablets', sortOrder: 2 },
      { name: 'Smart Watches', slug: 'smart-watches', sortOrder: 3 },
      { name: 'Smart Home', slug: 'smart-home', sortOrder: 4 },
      { name: 'Charging Accessories', slug: 'charging-accessories', sortOrder: 5 },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Cables, adapters, chargers, mounts, and toolkits.',
    sortOrder: 12,
    subcategories: [
      { name: 'HDMI Cables', slug: 'hdmi-cables', sortOrder: 1 },
      { name: 'DisplayPort Cables', slug: 'displayport-cables', sortOrder: 2 },
      { name: 'USB Cables', slug: 'usb-cables', sortOrder: 3 },
      { name: 'Adapters', slug: 'adapters', sortOrder: 4 },
      { name: 'Chargers', slug: 'chargers', sortOrder: 5 },
      { name: 'Mounts', slug: 'mounts', sortOrder: 6 },
      { name: 'Toolkits', slug: 'toolkits', sortOrder: 7 },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding new category structure...');

  for (const cat of categoryStructure) {
    // Create or update main category
    const mainCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        parentId: null,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });

    console.log(`✅ Main category: ${mainCategory.name}`);

    // Create or update subcategories
    for (const sub of cat.subcategories) {
      const subCategory = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          sortOrder: sub.sortOrder,
          parentId: mainCategory.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          sortOrder: sub.sortOrder,
          parentId: mainCategory.id,
        },
      });

      console.log(`   └─ Subcategory: ${subCategory.name}`);
    }
  }

  console.log('🎉 Category seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
