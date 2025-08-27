import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayloadExt } from '../types/index.js';

export function authRequired(req: Request, res: Response, next: NextFunction): Response | void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as jwt.JwtPayload & JwtPayloadExt;
    const id = Number(payload.sub);
    if (!Number.isFinite(id)) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
