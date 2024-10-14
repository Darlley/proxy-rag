import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: 'prisma://neon'
      }
    }
  }).$extends({
    query: {
      $allOperations({ operation, args, query }) {
        return adapter.queryRaw(args);
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
