import express, { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Auth from '../middleware/authMiddleware';
import {
  generateReportWinnerControllers,
  getAuctionWinners,
  getUserAuctionWinners,
  placeBid,
} from '../controllers/bidControllers/bidController';

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
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token (e.g., "Bearer {token}")
 *         schema:
 *           type: string
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
      await placeBid(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error placing bid', error });
    }
  })
);

// get all auction-winner
router.get('/auction-winner', async (req: Request, res: Response) => {
  try {
    await getAuctionWinners(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions winner', error });
  }
});

// get a particular auction-winner
router.get(
  '/UserAuctionWinner',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await getUserAuctionWinners(req, res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching user auctions won', error });
    }
  })
);

// generate report
router.get(
  '/api/AuctionWinner-report',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await generateReportWinnerControllers(req, res);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error generating report for auctions winners',
          error,
        });
    }
  })
);

router.get('/test', (req, res) => {
  res.send('Bid API is working!');
});

export default router;
