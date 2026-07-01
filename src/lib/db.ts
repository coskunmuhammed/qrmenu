import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaOptions: any = {};

if (process.env.VERCEL === '1' || !process.env.DATABASE_URL) {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  prismaOptions = {
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  };
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

