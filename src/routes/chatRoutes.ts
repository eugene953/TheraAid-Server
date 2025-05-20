import { Router } from 'express';
import { handleChat, handleStartChatSession } from '../controllers/chatController';
import Auth from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';


const router = Router();


router.post("/startChatSession",
  asyncHandler(Auth),
  asyncHandler(handleStartChatSession)
);

router.post( '/chat',
    asyncHandler(Auth),
    asyncHandler(handleChat)
  );

export default router;
