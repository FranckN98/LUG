#!/usr/bin/env node

/**
 * Quick verification script for the LemFi Contest system
 * Run with: node scripts/verify-lemfi-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, result, details = '') {
  checks.push({ name, result, details });
  const icon = result ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
}

console.log('🔍 LemFi Contest System Verification\n');

// 1. Check schema
check(
  'Prisma schema includes LemFiContestEntry',
  fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf-8')
    .includes('model LemFiContestEntry')
);

// 2. Check services
check(
  'lemfiContest.ts exists',
  fs.existsSync(path.join(__dirname, '../src/lib/lemfiContest.ts'))
);

check(
  'lemfiContestEmail.ts exists',
  fs.existsSync(path.join(__dirname, '../src/lib/lemfiContestEmail.ts'))
);

// 3. Check API routes
const apiRoutes = [
  '/api/lemfi-contest/register/route.ts',
  '/api/lemfi-contest/track/[token]/route.ts',
  '/api/admin/lemfi-contest/route.ts',
  '/api/admin/lemfi-contest/[entryId]/route.ts',
];

apiRoutes.forEach((route) => {
  check(`API route exists: ${route}`, fs.existsSync(path.join(__dirname, `../src/app${route}`)));
});

// 4. Check pages
const pages = [
  '/lemfi-contest/page.tsx',
  '/lemfi-contest/track/[token]/page.tsx',
  '/admin/lemfi-contest/page.tsx',
];

pages.forEach((page) => {
  check(`Page exists: ${page}`, fs.existsSync(path.join(__dirname, `../src/app${page}`)));
});

// 5. Check environment setup
console.log('\n📋 Environment Checklist:');

const envKeys = ['RESEND_API_KEY'];
const envFile = path.join(__dirname, '../.env.local');

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envKeys.forEach((key) => {
    check(`${key} configured`, envContent.includes(key));
  });
} else {
  console.log('⚠️  .env.local not found - create it with required keys');
}

// 6. Check configurations
console.log('\n⚙️  Manual Configuration Required:');

const configs = [
  { name: 'LemFi logo', path: 'public/partners/lemfi-logo.*', critical: false },
  { name: 'LemFi partner link', search: '[LIEN_PARTENAIRE_LEMFI]', critical: true },
  { name: 'Privacy policy link', search: '/privacy', critical: true },
];

configs.forEach((config) => {
  const isCritical = config.critical ? ' [CRITICAL]' : '';
  console.log(
    `${config.critical ? '🔴' : '🟡'} Replace ${config.name}${isCritical}`
  );
});

// Summary
console.log('\n📊 Summary:');
const total = checks.length;
const passed = checks.filter((c) => c.result).length;
const failed = checks.filter((c) => !c.result).length;

console.log(`Total checks: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Ready to migrate.');
  console.log('\nNext steps:');
  console.log('1. npx prisma generate');
  console.log('2. npx prisma db push');
  console.log('3. npm run dev');
  console.log('4. Visit http://localhost:3000/lemfi-contest');
} else {
  console.log('\n⚠️  Please fix the failed checks above.');
  process.exit(1);
}
