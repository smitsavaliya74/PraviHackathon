import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';
import { requireRole } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate({ body: loginSchema }), (req, res, next) =>
  authController.login(req, res, next)
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (SUPER_ADMIN/DEPT_ADMIN only)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/register',
  authenticate,
  requireRole('SUPER_ADMIN', 'DEPT_ADMIN'),
  validate({ body: registerSchema }),
  (req, res, next) => authController.register(req, res, next)
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  (req, res, next) => authController.refresh(req, res, next)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (invalidate refresh token)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/profile', authenticate, (req, res, next) =>
  authController.getProfile(req, res, next)
);

export default router;
