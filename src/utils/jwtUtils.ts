import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET_KEY } from './env_variable';
dotenv.config();

if (!JWT_SECRET_KEY) {
  throw new Error(
    'Environment variable JWT_SECRET_KEY is missing. Please define it in the .env file.'
  );
}

export const generateJWT = (userId: number): string => {
  try {
    // Generate a signed JWT using the secret key
    return jwt.sign({ id: userId }, JWT_SECRET_KEY, { expiresIn: '1h' });
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Failed to generate token.');
  }
};
