import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ data: departments });
  } catch (err) {
    next(err);
  }
});

export default router;
