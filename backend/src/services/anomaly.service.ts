import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export class AnomalyService {
  async getAnomalies(params: {
    page?: number;
    limit?: number;
    isResolved?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.isResolved !== undefined) {
      where.isResolved = params.isResolved === 'true';
    }

    const [anomalies, total] = await Promise.all([
      prisma.anomalyAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.anomalyAlert.count({ where }),
    ]);

    return { anomalies, total };
  }

  async resolveAnomaly(id: string, userId: string) {
    const anomaly = await prisma.anomalyAlert.findUnique({ where: { id } });
    if (!anomaly) throw new AppError('Anomaly not found', 404);

    return prisma.anomalyAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
      }
    });
  }

  async simulateAnomaly() {
    const asset = await prisma.asset.findFirst();
    if (!asset) throw new AppError('No assets exist to create an anomaly for', 400);
    
    return prisma.anomalyAlert.create({
      data: {
        title: 'AI Detected Tampering',
        type: 'GPS_SPOOFING',
        severity: 'CRITICAL',
        description: 'Simulated GPS spoofing detected by AI.',
        entityType: 'ASSET',
        entityId: asset.id
      }
    });
  }
}

export const anomalyService = new AnomalyService();
