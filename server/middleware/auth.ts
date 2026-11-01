import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbUsers } from '../services/dbService.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'imovies_jwt_super_secret_production_key_2026_xyz';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'user' | 'admin'; name: string };

    const user = await dbUsers.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, error: 'User associated with token no longer exists.' });
      return;
    }

    req.user = {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Access denied. Administrative privileges required.' });
    return;
  }
  next();
}
