import { Request, Response } from 'express';
import { createBidQuery, getHighestBid } from '../models/bidModel';
import * as bidService from '../services/bidService';
import { bidType } from '../types/bidTypes';
import { io } from '../server';

export const placeBid = async (req: Request, res: Response) => {
  try {
    const { auction_id, bid_amount } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user_id = parseInt(req.user.id, 10);

    if (isNaN(user_id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    console.log('validated user_id:', user_id);

    const currentBid = await getHighestBid(auction_id);

    if (bid_amount <= currentBid) {
      return res
        .status(400)
        .json({ message: 'Bid must be higher than the current bid' });
    }

    const newBid = await bidService.createBid({
      auction_id,
      user_id,
      bid_amount,
    });

    // Emiting real-time updates to all client via Socket.IO
    io.emit('bidUpdates', {
      auction_id,
      amount: bid_amount,
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid', error });
  }
};
