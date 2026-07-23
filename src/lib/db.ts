// A single shared Prisma client. In dev, Next's hot reload re-imports modules constantly; without
// the global cache that would open a new database connection pool on every reload and exhaust it.
//
// Prisma 7 connects through a driver adapter. We use Postgres (pg) so the same code runs locally and
// on Vercel against Neon. The connection string comes from DATABASE_URL.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
