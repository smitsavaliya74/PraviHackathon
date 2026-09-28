import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../services/audit.service';

export class UserController {
  /**
   * List users (SUPER_ADMIN sees all, DEPT_ADMIN sees own department).
   */
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', role, departmentId, search } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      // Department scoping
      if (req.user?.role === 'DEPT_ADMIN') {
        where.departmentId = req.user.departmentId;
      } else if (departmentId) {
        where.departmentId = departmentId;
      }

      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            departmentId: true,
            department: { select: { id: true, name: true, code: true } },
            phone: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single user by ID.
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          departmentId: true,
          department: { select: { id: true, name: true, code: true } },
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // DEPT_ADMIN can only see users in their department
      if (
        req.user?.role === 'DEPT_ADMIN' &&
        user.departmentId !== req.user.departmentId
      ) {
        throw new AppError('Access denied', 403);
      }

      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a user (SUPER_ADMIN can update any, DEPT_ADMIN can update own dept users).
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, phone, role, departmentId, isActive } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('User not found', 404);
      }

      // DEPT_ADMIN can only update users in their department
      if (
        req.user?.role === 'DEPT_ADMIN' &&
        existing.departmentId !== req.user.departmentId
      ) {
        throw new AppError('Access denied', 403);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (isActive !== undefined) updateData.isActive = isActive;

      // Only SUPER_ADMIN can change roles and departments
      if (req.user?.role === 'SUPER_ADMIN') {
        if (role !== undefined) updateData.role = role;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          departmentId: true,
          department: { select: { id: true, name: true, code: true } },
          phone: true,
          isActive: true,
          updatedAt: true,
        },
      });

      await createAuditLog({
        actorId: req.user?.userId,
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: id,
        before: {
          name: existing.name,
          phone: existing.phone,
          role: existing.role,
          departmentId: existing.departmentId,
          isActive: existing.isActive,
        },
        after: updateData,
      });

      res.json({ message: 'User updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all departments.
   */
  async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await prisma.department.findMany({
        include: {
          district: {
            include: {
              state: {
                include: { country: true },
              },
            },
          },
          _count: { select: { users: true, assets: true } },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ data: departments });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
