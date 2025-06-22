import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserProps } from '../types/userTypes';
import { AdminProps } from '../types/adminTypes';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserProps | AdminProps;
  }
}

const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Access authorization header
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Authorization Header:', req.headers.authorization);

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Authentication Failed: No Token Provided' });
    }

    console.log('Extracted Token:', token);

    const secretKey =
      process.env.JWT_SECRET || 'zDJzXV5W5mR0Ysz2uJNhfoWvEutpZwVnPt2bG1ipnEU=';

    // Decode the token
    const decoded = jwt.verify(token, secretKey) as {
      id?: string;
      role?: 'user' | 'admin';
      email?: string;
    };

    console.log('Decoded Token:', decoded);

    if (!decoded.id) {
      console.error('JWT Error: User ID not found in token');
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    if (!decoded.role) {
      console.error('JWT Error: User role not found in token');
      return res.status(401).json({ message: 'User role not found in token' });
    }

    // Assign user based on role
    if (decoded.role === 'user') {
      req.user = {
        id: decoded.id,
        role: 'user',
        email: decoded.email,
      } as UserProps;
    } else if (decoded.role === 'admin') {
      req.user = {
        id: decoded.id,
        role: 'admin',
        email: decoded.email,
      } as AdminProps;
    }

    console.log(`User Authenticated: ID=${decoded.id}, Role=${decoded.role}`);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication Failed!' });
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
