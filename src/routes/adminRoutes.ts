import express, { Router, Request, Response, NextFunction } from 'express';
import {
  deleteUserController,
  getAdminById,
  getAllUsersController,
  getUserEngagementReportController,
  getUserFeedbackController,
  getUserReminderController,
  registerAdminController,
} from '../controllers/adminControllers/adminController';
import { asyncHandler } from '../utils/asyncHandler';
import Auth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/adminRegister', async (req: Request, res: Response) => {
  try {
    await registerAdminController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
});

router.get(
  '/admin/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await getAdminById(req, res);
    } catch (error) {
      console.error('Error fetching admin details:', error);
      res.status(500).json({ message: 'Error fetching admin details' });
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

router.get(
  '/api/getUserReminder',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getUserReminderController(req, res);
    } catch (error) {
      console.error('Error getting user reminders:', error);
      res.status(500).json({ message: 'Error getting user reminders' });
    }
  }
);

router.get(
  '/api/getUserFeedback',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getUserFeedbackController(req, res);
    } catch (error) {
      console.error('Error getting user feedback:', error);
      res.status(500).json({ message: 'Error getting user feedback' });
    }
  }
);

router.get(
  '/api/userEngagement',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getUserEngagementReportController(req, res);
    } catch (error) {
      console.error('Error getting user feedback:', error);
      res.status(500).json({ message: 'Error getting user feedback' });
    }
  }
);

export default router;
