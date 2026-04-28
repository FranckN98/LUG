const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.NEON_DATABASE_URL,
  });
  const data = JSON.parse(fs.readFileSync('prisma-dump.json', 'utf8'));
  // Re-generated client must currently be the postgresql one.
  const r = await prisma.communicationSettings.createMany({
    data: data.communicationSettings,
    skipDuplicates: true,
  });
  console.log('communicationSettings:', r.count);
  await prisma.$disconnect();
})();
