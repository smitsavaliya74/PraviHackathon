import { Request, Response, NextFunction } from 'express';
import { workOrderService } from '../services/workorder.service';

export class WorkOrderController {
  async getWorkOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const status = req.query.status as string;

      const result = await workOrderService.getWorkOrders({ page, limit, status });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createWorkOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await workOrderService.createWorkOrder(req.body, req.user!.userId);
      res.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await workOrderService.updateWorkOrder(req.params.id, req.body, req.user!.userId);
      res.json({ data: order });
    } catch (error) {
      next(error);
    }
  }
}

export const workOrderController = new WorkOrderController();
