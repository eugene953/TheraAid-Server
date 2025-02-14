import express, { Router, Request, Response, NextFunction } from 'express';
import { registerAdminController } from '../controllers/adminControllers/adminController';

const router = express.Router();

router.post(
  '/adminRegister',

  async (req: Request, res: Response) => {
    try {
      await registerAdminController(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error registering admin', error });
    }
  }
);

export default router;
