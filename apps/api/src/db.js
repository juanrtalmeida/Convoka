import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString,
    allowExitOnIdle: true,
    idleTimeoutMillis: 100
});
const adapter = new PrismaPg(pool);
// Global para evitar múltiplas instâncias em dev no Hot Reload
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
