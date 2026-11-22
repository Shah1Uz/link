const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log("Total products in DB:", products.length);
  for (const p of products) {
    console.log(`- [${p.id}] "${p.title}" | price: ${p.price} | type: ${p.type} | enabled: ${p.isEnabled} | profile: ${p.profileId}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
