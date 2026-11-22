const fs = require('fs');
const path = require('path');

const schemaPrismaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schemaPgPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');

const sqliteSchema = fs.readFileSync(schemaPrismaPath, 'utf8');
const pgSchema = sqliteSchema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');

fs.writeFileSync(schemaPgPath, pgSchema, 'utf8');
console.log(`[Sync] Successfully generated prisma/schema.postgresql.prisma (${pgSchema.length} bytes)`);
