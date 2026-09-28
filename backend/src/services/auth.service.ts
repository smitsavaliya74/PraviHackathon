import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../utils/jwt';
import { createAuditLog } from './audit.service';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user (SUPER_ADMIN or DEPT_ADMIN can create users).
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: Role;
    departmentId?: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        departmentId: data.departmentId,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      actorId: null, // will be set by controller if available
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      after: user,
    });

    return user;
  }

  /**
   * Login with email and password. Returns tokens and user info.
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: { select: { id: true, name: true, code: true } },
        office: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        state: { select: { id: true, name: true } },
        country: { select: { id: true, name: true } }
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || undefined,
      stateId: user.stateId || undefined,
      districtId: user.districtId || undefined,
      officeId: user.officeId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await createAuditLog({
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department,
        stateId: user.stateId,
        state: user.state,
        districtId: user.districtId,
        district: user.district,
        officeId: user.officeId,
        office: user.office,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || undefined,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout: invalidate the refresh token.
   */
  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await createAuditLog({
      actorId: userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
    });
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
