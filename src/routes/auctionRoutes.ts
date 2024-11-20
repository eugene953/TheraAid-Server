import express, { Request, Response } from 'express';

import {
  createAuctionController,
  getAllAuctionsController,
  getAuction,
} from '../controllers/auctionController';

const router = express.Router();

// POST request to create an auction
router.post('/create', async (req: Request, res: Response) => {
  try {
    await createAuctionController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error creating auction', error });
  }
});

// GET request to fetch all auctions
router.get('/auctions/fetch', async (req: Request, res: Response) => {
  try {
    await getAllAuctionsController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions', error });
  }
});

router.get('/fetch/:id', async (req: Request, res: Response) => {
  try {
    await getAuction(req, res);
  } catch (error) {
    console.error('Error in route handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
