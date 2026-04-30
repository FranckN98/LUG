const path = require('path');
const absolute = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasourceUrl: `file:${absolute}` });
(async () => {
  const r = {
    media: await p.media.count(),
    member: await p.member.count(),
    event: await p.event.count(),
    newsletterSubscriber: await p.newsletterSubscriber.count(),
    partner: await p.partner.count(),
    blogPost: await p.blogPost.count(),
    siteConfig: await p.siteConfig.count(),
    venue: await p.venue.count(),
    homeButton: await p.homeButton.count(),
    communicationSettings: await p.communicationSettings.count(),
  };
  console.log(JSON.stringify(r, null, 2));
  await p.$disconnect();
})();
