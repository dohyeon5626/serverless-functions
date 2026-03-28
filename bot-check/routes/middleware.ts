import { Request, Response, NextFunction } from 'express';
import AppError from './exception';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ status: 404, message: 'Not Found' });
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.log(err);
  const appErr = err as AppError;
  if (!appErr.status || !appErr.message) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  } else {
    res.status(appErr.status).json({ status: appErr.status, message: appErr.message });
  }
};
