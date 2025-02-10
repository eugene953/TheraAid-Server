import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserProps } from '../types/userTypes';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserProps;
  }
}

const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // access authorize header to validate request
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Authorization Header:', req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Authenticate Failed' });
    }
    console.log('Extracted Token:', token);

    // retrive user details of logged in user
    const decoded = jwt.verify(
      token,
      'zDJzXV5W5mR0Ysz2uJNhfoWvEutpZwVnPt2bG1ipnEU='
    ) as UserProps;

    // Ensure only the id is set in req.user
    req.user = { id: decoded.id } as UserProps;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication Failed!' });
  }
};

export default Auth;

export function localVariables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}
