import { Request, Response, NextFunction } from 'express';

// Wrapper for handling async errors in middleware/route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
