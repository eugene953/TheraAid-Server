import { Request, Response } from 'express';
import { createBidQuery, getHighestBid } from '../models/bidModel';
import * as bidService from '../services/bidService';
import { bidType } from '../types/bidTypes';
import { io } from '../server';

export const placeBid = async (req: Request, res: Response) => {
  const { auction_id, user_id, bid_amount }: bidType = req.body;

  try {
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

    // Emit real-time updates to all client via Socket.IO
    io.emit('bidUpdates', {
      auction_id,
      amount: bid_amount,
    });

    res.status(201).json(newBid);
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid', error });
  }
};
