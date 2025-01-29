import { Request, Response } from 'express';
import { createBidQuery, fetchAuctionWinnersQuery, getHighestBid, updateEndedAuctionsQuery } from '../models/bidModel';
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
      message: `New bid placed: ${bid_amount} XAF by User ${user_id}`,
      bidderId: user_id,
    });

    // Emit real-time notification (excluding the bidder)
    io.to('notifications').emit('newNotification', {
      message: `A new bid of ${bid_amount} XAF has been placed on Auction ${auction_id}!`,
      exclude: user_id,
    });

    {
      /**

      // Emit real-time notification to all connected users
    const notificationMessage = `User ${user_id} placed a new bid of ${bid_amount} XAF on auction ${auction_id}`;
    const ioInstance = req.app.get('io');
    ioInstance.emit('bidUpdates', {
      auction_id,
      bid_amount,
      user_id,
      message: notificationMessage,
    });

    */
    }

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid', error });
  }
};

export const getAuctionWinners = async (req: Request, res: Response) => {
  try {
    const winners = await fetchAuctionWinnersQuery();
    res.status(200).json(winners);
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    res.status(500).json({ message: 'Failed to fetch auction winners' });
  }
};

export const handleAuctionLifecycle = async () => {
  try {
    const now = new Date();

    // Update auctions with expired end_date to 'ended'
    const endedAuctions = await updateEndedAuctionsQuery(now);

    if (endedAuctions.length > 0) {
      console.log('Auctions ended:', endedAuctions);

      
      const winners = await fetchAuctionWinnersQuery();
      console.log('Auction winners:', winners);

      io.emit('auctionWinners', winners);
    }
  } catch (error) {
    console.error('Error handling auction lifecycle:', error);
  }
};