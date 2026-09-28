import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users (paginated, filterable)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/',
  authenticate,
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN', 'AUDITOR'),
  (req, res, next) => userController.listUsers(req, res, next)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN', 'AUDITOR'),
  (req, res, next) => userController.getUser(req, res, next)
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN'),
  (req, res, next) => userController.updateUser(req, res, next)
);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/departments/list',
  authenticate,
  (req, res, next) => userController.listDepartments(req, res, next)
);

export default router;
