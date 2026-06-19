import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.user.updateMany({
    where: { isVerified: false },
    data: { isVerified: true },
  });
  console.log(`Marked ${result.count} existing users as verified.`);
}

main().finally(() => prisma.$disconnect());
