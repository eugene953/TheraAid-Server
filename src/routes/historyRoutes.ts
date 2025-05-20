import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Auth from '../middleware/authMiddleware';
import { handleGetUserHistory } from '../controllers/historyController';
//import { getUserChatHistory } from '../controllers/historyController';

const router = express.Router();

router.get('/chat/history/:user_id', 
  asyncHandler(Auth),
  asyncHandler(handleGetUserHistory)
);

export default router;