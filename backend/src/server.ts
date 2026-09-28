import app from './app';
import { config } from './config';
import prisma from './lib/prisma';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║        AssetTrust API — Built for Billions       ║
╠══════════════════════════════════════════════════╣
║  Server:  http://localhost:${config.port}                 ║
║  Docs:    http://localhost:${config.port}/api/docs         ║
║  Health:  http://localhost:${config.port}/api/health       ║
║  Env:     ${config.nodeEnv.padEnd(38)}║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
