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

const router = express.Router();

// POST methods
router.post('/register', async (req: Request, res: Response) => {
  try {
    await registerUserController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

/**router.route('/registerMail').post((req:Request, res:Response) => {
    res.json('register route')
}); */

router.route('/authenticate').post((req: Request, res: Response) => {
  res.json('register route');
});
router.route('/login').post(loginController);

/** GET methods */

router.route('/user/:username').get(getUserController);
router.route('/generateOTP').get(generateOTPController);
router.route('/verifyOTP').get(verifyOTPController);
router.route('/createResetSession').get(createResetSessionController);

/** PUT methods */
router.route('/updateUser').put(updateUserController);
router.route('/resetPassword').put(resetPasswordController);

export default router;
