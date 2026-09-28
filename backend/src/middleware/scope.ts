import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';

export async function attachScope(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next();

  req.scope = await buildScope(req.user);
  next();
}

export async function buildScope(user: any) {
  if (user.role === 'SUPER_ADMIN') return {}; // Full access

  if (user.role === 'STATE_ADMIN' && user.stateId) {
    const depts = await prisma.department.findMany({
      where: { district: { stateId: user.stateId } },
      select: { id: true }
    });
    return { departmentId: { in: depts.map((d: any) => d.id) } };
  }

  if (user.role === 'DISTRICT_ADMIN' && user.districtId) {
    const depts = await prisma.department.findMany({
      where: { districtId: user.districtId },
      select: { id: true }
    });
    return { departmentId: { in: depts.map((d: any) => d.id) } };
  }

  if (user.departmentId) {
    return { departmentId: user.departmentId };
  }

  return { departmentId: 'NO_ACCESS' };
}
