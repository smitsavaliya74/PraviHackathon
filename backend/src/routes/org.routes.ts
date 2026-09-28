import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/structure', requireRole('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'), async (req, res, next) => {
  try {
    const countries = await prisma.country.findMany({
      include: {
        states: {
          include: {
            districts: {
              include: {
                departments: {
                  include: {
                    offices: true,
                    _count: { select: { users: true, assets: true } }
                  }
                },
                _count: { select: { users: true } }
              }
            },
            _count: { select: { users: true } }
          }
        },
        _count: { select: { users: true } }
      }
    });
    res.json({ data: countries });
  } catch (err) {
    next(err);
  }
});

export default router;
