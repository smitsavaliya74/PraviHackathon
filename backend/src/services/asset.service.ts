import prisma from '../lib/prisma';
import { createAuditLog } from './audit.service';
import { AppError } from '../middleware/errorHandler';

export class AssetService {
  async getAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    departmentId?: string;
    scope?: any;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = { ...params.scope };
    
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { assetId: { contains: params.search, mode: 'insensitive' } },
        { address: { contains: params.search, mode: 'insensitive' } }
      ];
    }
    
    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;
    if (params.departmentId) where.departmentId = params.departmentId;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);

    return { assets, total };
  }

  async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: { select: { name: true, email: true } },
      }
    });

    if (!asset) throw new AppError('Asset not found', 404);
    return asset;
  }

  async createAsset(data: any, userId: string, departmentId: string) {
    // Generate simple ID
    const count = await prisma.asset.count();
    const assetId = `AST-${Date.now().toString().slice(-4)}-${count + 1}`;

    const asset = await prisma.asset.create({
      data: {
        ...data,
        assetId,
        createdById: userId,
        departmentId: departmentId,
      }
    });

    await createAuditLog({
      actorId: userId,
      action: 'CREATE_ASSET',
      entityType: 'Asset',
      entityId: asset.id,
      after: asset,
    });

    return asset;
  }

  async updateAsset(id: string, data: any, userId: string) {
    const oldAsset = await prisma.asset.findUnique({ where: { id } });
    if (!oldAsset) throw new AppError('Asset not found', 404);

    const asset = await prisma.asset.update({
      where: { id },
      data
    });

    if (data.status && data.status !== oldAsset.status) {
       await prisma.assetStatusHistory.create({
          data: {
             assetId: id,
             fromStatus: oldAsset.status,
             toStatus: data.status,
             changedById: userId,
          }
       });
    }

    await createAuditLog({
      actorId: userId,
      action: 'UPDATE_ASSET',
      entityType: 'Asset',
      entityId: asset.id,
      before: oldAsset,
      after: asset,
    });

    return asset;
  }

  async deleteAsset(id: string, userId: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Asset not found', 404);

    await prisma.asset.delete({ where: { id } });

    await createAuditLog({
      actorId: userId,
      action: 'DELETE_ASSET',
      entityType: 'Asset',
      entityId: id,
      before: asset,
    });

    return { success: true };
  }
}

export const assetService = new AssetService();
