import express, { Router, Request, Response, NextFunction } from 'express';
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
import Auth from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

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
 *     summary: Authenticate a user and return a JWT.
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
 *       '200':
 *         description: Returns a JWT for successful login.
 *       '400':
 *         description: Invalid credentials provided.
 *       '500':
 *         description: Internal server error.
 */
// post request
router.post('/login', async (req: Request, res: Response) => {
  try {
    await loginController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});

/**
 * @swagger
 * /api/user/{username}:
 *   get:
 *     summary: Retrieve user data by username
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 profile:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid username provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/** GET methods */
router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    await getUserController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});

/**
 * @swagger
 * paths:
 *   /api/updateUser:
 *     put:
 *       summary: Update user information
 *       tags:
 *         - Users
 *       parameters:
 *         - in: query
 *           name: id
 *           required: true
 *           description: The id of the user to update
 *           schema:
 *             type: integer
 *         - in: header
 *           name: Authorization
 *           required: true
 *           description: Bearer token for authorization
 *           schema:
 *             type: string
 *             example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 address:
 *                   type: string
 *                 profile:
 *                   type: string
 *                   nullable: true
 *               required:
 *                 - username
 *                 - email
 *                 - phone_number
 *                 - address
 *                 - profile
 *       responses:
 *         200:
 *           description: Successfully updated user information
 *         400:
 *           description: Missing user ID or required fields
 *         404:
 *           description: User not found
 *         500:
 *           description: Internal server error
 */
/** PUT methods */
router.put(
  '/updateUser',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await updateUserController(req, res);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  })
);

/**router.route('/registerMail').post((req:Request, res:Response) => {
    res.json('register route')
}); */

router.route('/authenticate').post((req: Request, res: Response) => {
  res.json('register route');
});

/** GET methods */
router.route('/generateOTP').get(generateOTPController);
router.route('/verifyOTP').get(verifyOTPController);
router.route('/createResetSession').get(createResetSessionController);

/** PUT methods */
router.route('/resetPassword').put(resetPasswordController);

export default router;
