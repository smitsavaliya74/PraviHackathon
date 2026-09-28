import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * RBAC middleware factory. Restricts access to specified roles.
 * Must be used AFTER authenticate middleware.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to restrict DEPT_ADMIN to their own department's resources.
 * Checks if the departmentId in query/params/body matches user's department.
 * SUPER_ADMIN bypasses this check.
 */
export function requireDepartmentAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // SUPER_ADMIN and AUDITOR can access everything
  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'AUDITOR') {
    next();
    return;
  }

  // For DEPT_ADMIN and FIELD_OFFICER, check department scope
  const requestedDeptId =
    req.params.departmentId ||
    req.query.departmentId ||
    req.body?.departmentId;

  if (requestedDeptId && requestedDeptId !== req.user.departmentId) {
    res.status(403).json({
      error: 'Access denied: resource belongs to another department',
    });
    return;
  }

  next();
}
