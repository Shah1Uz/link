const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const links = await prisma.link.findMany({
    include: {
      profile: {
        select: { username: true }
      }
    }
  });
  console.log(JSON.stringify(links.map(l => ({
    id: l.id,
    username: l.profile?.username,
    title: l.title,
    url: l.url,
    displayMode: l.displayMode,
    isEnabled: l.isEnabled,
    isPinned: l.isPinned
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
