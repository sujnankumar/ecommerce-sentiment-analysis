import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/index.js';

function signToken(userId: number): string {
  const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '1d';
  const secret: Secret = process.env.JWT_SECRET || 'dev_secret';
  const options: SignOptions = { expiresIn } as SignOptions;
  return jwt.sign({ sub: String(userId) }, secret, options);
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body as { username?: string; email?: string; password?: string };
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, passwordHash });
    const token = signToken(user.id);
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(String(password), String(user.passwordHash));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user.id);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
