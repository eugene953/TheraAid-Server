import { Request, Response, NextFunction } from 'express';

const authorizeRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient rights' });
    }
    next();
  };
};

export default authorizeRole;
