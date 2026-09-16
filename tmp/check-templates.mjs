import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const count = await prisma.newsletterCampaign.count({ where: { isTemplate: true } });
console.log('template count:', count);
await prisma.$disconnect();
