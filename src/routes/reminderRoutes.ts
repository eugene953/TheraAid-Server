import express, { Router, Request, Response, NextFunction } from 'express';
import { createReminder, deleteReminder } from '../controllers/reminderController';
import { asyncHandler } from '../utils/asyncHandler';
import Auth from '../middleware/authMiddleware';
import '../utils/cronJob';

const router = express.Router();

router.post(
    '/api/reminder',
    asyncHandler(Auth),
    asyncHandler(
    async (req: Request, res: Response) => {
      try {
        await createReminder(req, res);
      } catch (error) {
        res.status(500).json({ message: 'Error creating reminder', error });
      }
    })
  );

  router.post(
   '/reminders/:reminderID',
    asyncHandler(Auth),
    asyncHandler(
    async (req: Request, res: Response) => {
      try {
        await deleteReminder(req, res);
      } catch (error) {
        res.status(500).json({ message: 'Error deleting Reminder', error });
      }
    })
  );

export default router;
