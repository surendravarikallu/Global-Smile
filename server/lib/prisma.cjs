const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon WebSocket for serverless
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

let prisma;

function createPrismaClient() {
  // Prisma v7: PrismaNeon takes a Pool config object and creates Pool internally
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // Singleton in dev (prevents connection pool exhaustion with nodemon)
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;
