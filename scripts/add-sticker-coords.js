const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  const colNames = cols.map((c) => c.name);

  if (!colNames.includes("stickerPosX")) {
    console.log("Adding stickerPosX column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Theme" ADD COLUMN "stickerPosX" REAL DEFAULT 85');
  }
  if (!colNames.includes("stickerPosY")) {
    console.log("Adding stickerPosY column...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Theme" ADD COLUMN "stickerPosY" REAL DEFAULT 12');
  }

  const updatedCols = await prisma.$queryRawUnsafe("PRAGMA table_info(Theme)");
  console.log("Updated Theme columns:", updatedCols.map((c) => c.name));
  await prisma.$disconnect();
}

main().catch(console.error);
