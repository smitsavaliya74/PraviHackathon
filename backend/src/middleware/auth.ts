import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { buildScope } from './scope';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      scope?: any;
    }
  }
}

/**
 * Authenticate requests using Bearer JWT access token.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    buildScope(payload).then(scope => {
      req.scope = scope;
      next();
    }).catch(next);
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

/**
 * Optional authentication - sets req.user if valid token present, but doesn't reject.
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token invalid, continue without user
    }
  }

  next();
}
