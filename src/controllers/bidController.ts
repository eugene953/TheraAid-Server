import { Request, Response } from 'express';
import { createBidQuery, getHighestBid } from '../models/bidModel';
import * as bidService from '../services/bidService';
import { bidType } from '../types/bidTypes';
import { io } from '../server';
import { fetchAuctionById } from '../models/auctionModel';

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

    // fetch auction details to verify ownership
    const auction = await fetchAuctionById(auction_id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.user_id === user_id) {
      return res
        .status(403)
        .json({ error: 'You cannot place a bid on your own auction' });
    }

    // Check current highest bid
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
      bid_amount,
      message: `New bid placed: ${bid_amount} XAF`,
      bidderId: user_id,
    });

    // Emit a real-time notification to all users except the bidder
    io.emit('newNotification', {
      auction_id,
      message: `A new bid of ${bid_amount} XAF has been placed!`,
      exclude: user_id,
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid', error });
  }
};
