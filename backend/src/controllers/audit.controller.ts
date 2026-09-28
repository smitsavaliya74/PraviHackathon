import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { verifyAuditChain } from '../services/audit.service';

export class AuditController {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { sequence: 'desc' },
        include: { actor: { select: { name: true, role: true } } },
      });

      res.json({ data: { logs } });
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verifyAuditChain();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
