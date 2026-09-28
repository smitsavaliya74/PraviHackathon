import { Router } from 'express';
import { assetController } from '../controllers/asset.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// GET /api/assets
router.get('/', (req, res, next) => assetController.getAssets(req, res, next));

// GET /api/assets/:id
router.get('/:id', (req, res, next) => assetController.getAssetById(req, res, next));

// POST /api/assets
router.post(
  '/',
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN'),
  (req, res, next) => assetController.createAsset(req, res, next)
);

// PUT /api/assets/:id
router.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN'),
  (req, res, next) => assetController.updateAsset(req, res, next)
);

// DELETE /api/assets/:id
router.delete(
  '/:id',
  requireRole('SUPER_ADMIN'),
  (req, res, next) => assetController.deleteAsset(req, res, next)
);

export default router;
