import { Router } from 'express';
import { workOrderController } from '../controllers/workorder.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// GET /api/work-orders
router.get('/', requireRole('SUPER_ADMIN', 'DEPT_ADMIN', 'FIELD_OFFICER'), (req, res, next) => workOrderController.getWorkOrders(req, res, next));

// POST /api/work-orders
router.post('/', requireRole('SUPER_ADMIN', 'DEPT_ADMIN'), (req, res, next) => workOrderController.createWorkOrder(req, res, next));

// PUT /api/work-orders/:id
router.put('/:id', requireRole('SUPER_ADMIN', 'DEPT_ADMIN', 'FIELD_OFFICER'), (req, res, next) => workOrderController.updateWorkOrder(req, res, next));

export default router;
