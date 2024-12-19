import express, { Router, Request, Response, NextFunction } from 'express';
import * as bidController from '../controllers/bidController';
import { asyncHandler } from '../utils/asyncHandler';
import Auth from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Bids
 *     description: Operations related to bids
 *
 * /api/bids:
 *   post:
 *     summary: Place a new bid
 *     tags:
 *       - Bids
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auction_id:
 *                 type: integer
 *                 description: ID of the auction
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *               bid_amount:
 *                 type: number
 *                 description: Amount of the bid
 *                 format: float
 *               bid_time:
 *                 type: string
 *                 format: date-time
 *                 description: Time the bid was placed
 *     responses:
 *       201:
 *         description: Bid successfully placed
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await bidController.placeBid(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error placing bid', error });
    }
  })
);

router.get('/test', (req, res) => {
  res.send('Bid API is working!');
});

export default router;
