// src/check-db.ts
import { prisma } from './db/prisma';

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log('DB OK:', result);
}

main().finally(() => prisma.$disconnect());
