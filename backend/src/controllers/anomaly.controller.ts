import { Request, Response, NextFunction } from 'express';
import { anomalyService } from '../services/anomaly.service';

export class AnomalyController {
  async getAnomalies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const isResolved = req.query.isResolved as string;

      const result = await anomalyService.getAnomalies({ page, limit, isResolved });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async resolveAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const anomaly = await anomalyService.resolveAnomaly(req.params.id, req.user!.userId);
      res.json({ data: anomaly });
    } catch (error) {
      next(error);
    }
  }

  async simulateAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const anomaly = await anomalyService.simulateAnomaly();
      res.status(201).json({ data: anomaly });
    } catch (error) {
      next(error);
    }
  }
}

export const anomalyController = new AnomalyController();
