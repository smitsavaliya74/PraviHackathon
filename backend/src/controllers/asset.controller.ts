import { Request, Response, NextFunction } from 'express';
import { assetService } from '../services/asset.service';

export class AssetController {
  async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const category = req.query.category as string;
      
      const departmentId = req.query.departmentId as string;
      const scope = req.scope;

      const result = await assetService.getAssets({ page, limit, search, status, category, departmentId, scope });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.json({ data: asset });
    } catch (error) {
      next(error);
    }
  }

  async createAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = req.user?.role === 'SUPER_ADMIN' && req.body.departmentId 
        ? req.body.departmentId 
        : req.user?.departmentId;
        
      if (!departmentId) {
         return res.status(400).json({ error: 'Department ID is required' });
      }

      const asset = await assetService.createAsset(req.body, req.user!.userId, departmentId);
      res.status(201).json({ data: asset });
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.updateAsset(req.params.id, req.body, req.user!.userId);
      res.json({ data: asset });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: Request, res: Response, next: NextFunction) {
    try {
      await assetService.deleteAsset(req.params.id, req.user!.userId);
      res.json({ message: 'Asset deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const assetController = new AssetController();
