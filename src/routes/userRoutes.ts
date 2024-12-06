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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               id_card_number:
 *                 type: number
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *               confirm_pwd:
 *                 type: string
 *               profile:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    await registerUserController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
// post request
router.post('/login', async (req: Request, res: Response) => {
  try {
    await loginController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});

/** GET methods */
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    await getUserController(req, res);
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
