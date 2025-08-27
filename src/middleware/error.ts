import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({ message: 'Not Found' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = (err && typeof err.status === 'number' && err.status) || 500;
  res.status(status).json({ message: err?.message || 'Internal Server Error' });
}
