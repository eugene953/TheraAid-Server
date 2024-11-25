import express, { Router, Request, Response } from 'express';
import {
  registerUserController,
  loginController,
  getUserController,
  generateOTPController,
  verifyOTPController,
  createResetSessionController,
  updateUserController,
  resetPasswordController,
} from '../controllers/userController';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST methods
router.post('/register', async (req: Request, res: Response) => {
  try {
    await registerUserController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// post request
router.post('/login', async (req: Request, res: Response) => {
  try {
    await loginController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});

/**router.route('/registerMail').post((req:Request, res:Response) => {
    res.json('register route')
}); */

router.route('/authenticate').post((req: Request, res: Response) => {
  res.json('register route');
});

/** GET methods */

router.route('/user/:username').get(getUserController);
router.route('/generateOTP').get(generateOTPController);
router.route('/verifyOTP').get(verifyOTPController);
router.route('/createResetSession').get(createResetSessionController);

/** PUT methods */
router.route('/updateUser').put(updateUserController);
router.route('/resetPassword').put(resetPasswordController);

export default router;
