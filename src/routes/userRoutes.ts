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
  getUserProfile,
} from '../controllers/userController';

import Auth, { localVariables } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  deleteUserController,
  getAllUsersController,
} from '../controllers/adminControllers/adminController';
import { upload } from '../utils/Cloudinary';
import { sendEmail } from '../controllers/mailer';
// import { registerMail } from '../controllers/mailer';

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
router.post(
  '/api/users/register',
  upload.single('profile'),
  async (req: Request, res: Response) => {
    try {
      await registerUserController(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }
);

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
router.get('api/user/:username', async (req: Request, res: Response) => {
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
 *         - in: header
 *           name: Authorization
 *           required: true
 *           description: >
 *             Bearer token for authorization. The token must follow the format:
 *             'Bearer <token>'. If the token is missing, invalid, or expired, the request will return a 401 Unauthorized error.
 *           schema:
 *             type: string
 *             example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJpYXQiOjE2ODg5NzM0MjJ9...
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: Sone
 *                 email:
 *                   type: string
 *                   example: sone@gmail.com
 *                 phone_number:
 *                   type: string
 *                   example: 678765456
 *                 address:
 *                   type: string
 *                   example: Bonaberi Douala
 *                 profile:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *               required:
 *                 - username
 *                 - email
 *                 - phone_number
 *                 - address
 *       responses:
 *         200:
 *           description: Successfully updated user information
 *         400:
 *           description: Missing user ID or required fields
 *         401:
 *           description: >
 *             Unauthorized - Bearer token is missing, invalid, or expired
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

/** get methods */
router.get(
  '/api/getAllUsers',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllUsersController(req, res);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Error getting all users' });
    }
  }
);

router.delete(
  '/api/deleteUser/:id',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteUserController(req, res);
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
);

// Route to fetch user by ID
router.get(
  '/getUserProfileById/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log('Received ID parameter:', id);
      await getUserProfile(req, res);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).json({
        message: 'Failed to fetch user profile',
        error: 'unknown error',
      });
    }
  })
);

/**router.route('/registerMail').post((req:Request, res:Response) => {
    res.json('register route')
}); */

router.post(
  '/generateOTP',
  asyncHandler(localVariables),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await generateOTPController(req, res);
    } catch (error) {
      console.error('Error generating OTP:', error);
      res.status(500).json({ message: 'Error generating OTP' });
    }
  })
);

router.post(
  '/verifyOTP',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await verifyOTPController(req, res);
    } catch (error) {
      console.error('Error verifying OTP', error);
      res.status(500).json({ error: 'Error verifying OTP' });
    }
  }
);

router.post(
  '/createResetSession',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await createResetSessionController(req, res);
    } catch (error) {
      console.error('Error creating reset session', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/** PUT methods */
router.put(
  '/resetPassword',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await resetPasswordController(req, res);
    } catch (error) {
      console.error('Error verifying OTP', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/send-email',
  async (req: Request, res: Response): Promise<void> => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text || !html) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    try {
      const response = await sendEmail(to, subject, text, html);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: 'Error sending email' });
    }
  }
);

{
  /**
   router.post( '/registerMail',
    async (req: Request, res: Response): Promise<void> => {
       try {
         await registerMail(req, res);
       } catch (error) {
         console.error('Error registering mail', error);
         res.status(500).json({ message: 'Error registering mail' });
       }
     });
 */
}
export default router;
