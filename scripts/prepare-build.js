const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Resolve DATABASE_URL from process.env or .env file
let dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match) dbUrl = match[1];
  }
}

const isSqlite = Boolean(dbUrl && (dbUrl.startsWith('file:') || (dbUrl.includes('.db') && !dbUrl.includes('postgres'))));
const targetProvider = isSqlite ? 'sqlite' : 'postgresql';

console.log(`[BioSpace Build Prep] Target database provider: ${targetProvider.toUpperCase()}`);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace datasource provider to match target
const updatedSchema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${targetProvider}"`
);

if (schema !== updatedSchema) {
  fs.writeFileSync(schemaPath, updatedSchema, 'utf8');
  console.log(`[BioSpace Build Prep] Updated prisma/schema.prisma provider to "${targetProvider}"`);
}

// Keep schema.postgresql.prisma in sync as well
const schemaPgPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');
const pgSchema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "postgresql"');
fs.writeFileSync(schemaPgPath, pgSchema, 'utf8');

// Generate Prisma Client
console.log(`[BioSpace Build Prep] Running prisma generate...`);
try {
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      // Provide valid fallback URL if not set so prisma generate succeeds in CI/build environments
      DATABASE_URL: dbUrl || (isSqlite ? 'file:./dev.db' : 'postgresql://postgres:postgres@localhost:5432/biospace?sslmode=require')
    }
  });
  console.log(`[BioSpace Build Prep] Prisma Client generated successfully.`);
} catch (err) {
  const clientExists = fs.existsSync(path.join(__dirname, '..', 'node_modules', '@prisma', 'client', 'index.js'));
  if (clientExists && process.platform === 'win32' && !process.env.VERCEL) {
    console.warn(`[BioSpace Build Prep] Notice: Local process has Prisma binary in use; using existing client.`);
  } else {
    console.error(`[BioSpace Build Prep] Failed to generate Prisma Client:`, err.message);
    process.exit(1);
  }
}
