import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const asset = await prisma.asset.findFirst();
  if (asset) {
    await prisma.anomalyAlert.create({
      data: {
        title: 'AI Detected Tampering',
        type: 'GPS_SPOOFING',
        severity: 'CRITICAL',
        description: 'Simulated GPS spoofing detected by AI.',
        entityType: 'ASSET',
        entityId: asset.id
      }
    });
    console.log('Anomaly created');
  }
}

run().finally(() => prisma.$disconnect());
