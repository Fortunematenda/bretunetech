const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function disableMaintenance() {
  try {
    const settings = await prisma.businessSettings.findFirst();
    if (settings) {
      await prisma.businessSettings.update({
        where: { id: settings.id },
        data: { maintenanceMode: false }
      });
      console.log('Maintenance mode disabled successfully');
    } else {
      console.log('No business settings found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

disableMaintenance();
