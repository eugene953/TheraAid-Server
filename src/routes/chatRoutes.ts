import { Router } from 'express';
import {
  handleChat,
  handleGetMessagesBySession,
  handleStartChatSession,
} from '../controllers/chatController';
import Auth from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /startChatSession:
 *   post:
 *     summary: Start a new chat session for a user
 *     tags:
 *       - Chat
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Chat session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                   example:
 *                     session_id: 123
 *                     user_id: 1
 *                     started_at: "2025-06-10T12:00:00Z"
 *       500:
 *         description: Failed to start session
 */

router.post(
  '/startChatSession',
  asyncHandler(Auth),
  asyncHandler(handleStartChatSession)
);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the chatbot and receive a reply
 *     tags:
 *       - Chat
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - message
 *               - session_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               message:
 *                 type: string
 *                 example: "I feel overwhelmed lately."
 *               session_id:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Reply from the chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "I'm here for you. Can you tell me more?"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to process message
 */
router.post('/chat', asyncHandler(Auth), asyncHandler(handleChat));

/**
 * @swagger
 * /chat/messages/{session_id}:
 *   get:
 *     summary: Retrieve all chat messages for a session
 *     tags:
 *       - Chat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the chat session
 *     responses:
 *       200:
 *         description: List of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       response:
 *                         type: string
 *                       session_id:
 *                         type: integer
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Could not retrieve messages
 */
router.get(
  '/chat/messages/:session_id',
  asyncHandler(Auth),
  asyncHandler(handleGetMessagesBySession)
);

export default router;
