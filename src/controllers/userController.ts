import { Request, Response } from 'express';
import { registerUser } from '../services/userService';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  res.json('login route');
};

export const getUserController = async (req: Request, res: Response) => {
  res.json('getUser route');
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
