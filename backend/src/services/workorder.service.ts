import prisma from '../lib/prisma';
import { createAuditLog } from './audit.service';
import { AppError } from '../middleware/errorHandler';

export class WorkOrderService {
  async getWorkOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { id: true, name: true, assetId: true, address: true } },
          technician: { select: { id: true, name: true } },
        }
      }),
      prisma.workOrder.count({ where }),
    ]);

    return { workOrders, total };
  }

  async createWorkOrder(data: any, userId: string) {
    const workOrder = await prisma.workOrder.create({
      data: {
        ...data,
      }
    });

    await createAuditLog({
      actorId: userId,
      action: 'CREATE_WORK_ORDER',
      entityType: 'WorkOrder',
      entityId: workOrder.id,
      after: workOrder,
    });

    return workOrder;
  }

  async updateWorkOrder(id: string, data: any, userId: string) {
    const oldOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!oldOrder) throw new AppError('Work Order not found', 404);

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data
    });

    await createAuditLog({
      actorId: userId,
      action: 'UPDATE_WORK_ORDER',
      entityType: 'WorkOrder',
      entityId: workOrder.id,
      before: oldOrder,
      after: workOrder,
    });

    return workOrder;
  }
}

export const workOrderService = new WorkOrderService();
