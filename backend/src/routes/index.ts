import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import assetRoutes from './asset.routes';
import departmentRoutes from './department.routes';
import orgRoutes from './org.routes';
import auditRoutes from './audit.routes';
import workOrderRoutes from './workorder.routes';
import anomalyRoutes from './anomaly.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/departments', departmentRoutes);
router.use('/org', orgRoutes);
router.use('/audit', auditRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/anomalies', anomalyRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AssetTrust API',
    version: '1.0.0',
  });
});

export default router;
