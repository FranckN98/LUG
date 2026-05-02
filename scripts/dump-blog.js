/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.blogPost.findMany({ include: { translations: true }, orderBy: { createdAt: 'asc' } }).then((rows) => {
  for (const r of rows) {
    console.log(`\n=== ${r.id} ===`);
    console.log(`title: ${r.title}`);
    console.log(`category: ${r.category}`);
    console.log(`---BODY---`);
    console.log(r.body);
    console.log(`---END---`);
  }
  return p.$disconnect();
});
