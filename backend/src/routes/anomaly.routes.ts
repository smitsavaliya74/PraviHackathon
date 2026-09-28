import { Router } from 'express';
import { anomalyController } from '../controllers/anomaly.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// GET /api/anomalies
router.get('/', requireRole('SUPER_ADMIN', 'DEPT_ADMIN', 'AUDITOR'), (req, res, next) => anomalyController.getAnomalies(req, res, next));

// PUT /api/anomalies/:id/resolve
router.put('/:id/resolve', requireRole('SUPER_ADMIN', 'DEPT_ADMIN'), (req, res, next) => anomalyController.resolveAnomaly(req, res, next));

// POST /api/anomalies/simulate
router.post('/simulate', requireRole('SUPER_ADMIN'), (req, res, next) => anomalyController.simulateAnomaly(req, res, next));

export default router;
