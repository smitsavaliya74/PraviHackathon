import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      res.json({
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      await authService.logout(req.user.userId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const profile = await authService.getProfile(req.user.userId);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
