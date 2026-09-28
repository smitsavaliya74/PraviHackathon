import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// GET /api/audit
router.get('/', requireRole('SUPER_ADMIN', 'AUDITOR'), (req, res, next) => auditController.getLogs(req, res, next));

// GET /api/audit/verify
router.get('/verify', requireRole('SUPER_ADMIN', 'AUDITOR'), (req, res, next) => auditController.verify(req, res, next));

export default router;
