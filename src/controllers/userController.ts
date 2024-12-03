import { Request, Response } from 'express';
import { registerUser } from '../services/userService';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { generateJWT } from '../utils/jwtUtils';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // check  if username exist in database
    const query = `SELECT * FROM users WHERE username = $1`;
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Comparing passwords...');

    const user = rows[0];
    // Comparing provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate the JWT token
    const token = generateJWT(user.id);
    console.log('Generated JWT:', token);

    // Returning login success with token
    return res.status(200).json({
      message: 'Login successful',
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error login user', error });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  const { username } = req.params;
};

export const updateUserController = async (req: Request, res: Response) => {
  res.json('updateUser route');
};

export const generateOTPController = async (req: Request, res: Response) => {
  res.json('generateOTP route');
};

export const verifyOTPController = async (req: Request, res: Response) => {
  res.json('verifyOTP route');
};

export const createResetSessionController = async (
  req: Request,
  res: Response
) => {
  res.json('createResetSession route');
};

export const resetPasswordController = async (req: Request, res: Response) => {
  res.json('resetPassword route');
};
