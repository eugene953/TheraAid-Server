import express, { Request, Response } from 'express';

import {
  createAuctionController,
  getAllAuctionsController,
  getAllProductOfUserController,
  getAuction,
} from '../controllers/auctionController';
import Auth from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// POST request to create an auction
/**
 * @swagger
 * /api/auctions/create:
 *   post:
 *     summary: Create a new auction
 *     tags:
 *       - Auctions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               start_bid:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string;
 *     responses:
 *       200:
 *         description: Auction created successfully
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    await createAuctionController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error creating auction', error });
  }
});

/**
 * @swagger
 * /api/auctions/fetch:
 *   get:
 *     summary: Get all auctions
 *     tags:
 *       - Auctions
 *     responses:
 *       200:
 *         description: List of auctions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the auction
 *                   title:
 *                     type: string
 *                     description: Title of the auction
 *                   description:
 *                     type: string
 *                     description: Detailed description of the auction
 *                   category:
 *                     type: string
 *                     description: Category of the item being auctioned
 *                   grade:
 *                     type: string
 *                     description: Grade of the item
 *                   start_bid:
 *                     type: number
 *                     description: Starting bid amount
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                     description: Auction start date and time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                     description: Auction end date and time
 *                   image:
 *                     type: string
 *                     description: URL of the item image
 */
// GET request to fetch all auctions
router.get('/auctions/fetch', async (req: Request, res: Response) => {
  try {
    await getAllAuctionsController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions', error });
  }
});

/**
 * @swagger
 * /api/auctions/fetch/{id}:
 *   get:
 *     summary: Get a specific auction by ID
 *     tags:
 *       - Auctions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the auction
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction details
 *       404:
 *         description: Auction not found
 */
router.get('/fetch/:id', async (req: Request, res: Response) => {
  try {
    await getAuction(req, res);
  } catch (error) {
    console.error('Error in route handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get(
  '/user',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllProductOfUserController(req, res);
    } catch (error) {
      res.status(500).json({ message: 'An unexpected error occurred', error });
    }
  })
);

export default router;
