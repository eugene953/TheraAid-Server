import { Request, Response } from 'express';
import {
  createBidQuery,
  fetchAuctionWinnersQuery,
  fetchUserAuctionWinnersQuery,
  getHighestBid,
  updateEndedAuctionsQuery,
} from '../../models/bidModel';
import * as bidService from '../../services/bidService';
import { bidType } from '../../types/bidTypes';

import { fetchAuctionById } from '../../models/auctionModel';
import { io } from '../../index';
import pool from '../../config/database';
import { title } from 'process';

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

    // Fetch the bidder's username
    const userQuery = `SELECT username FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [user_id]);
    const username = userResult.rows[0]?.username || 'Unknown User';

    // Fetch the auction title
    const auctionQuery = `SELECT title FROM auctions WHERE id = $1`;
    const auctionResult = await pool.query(auctionQuery, [auction_id]);
    const title = auctionResult.rows[0]?.title || 'Unknown Auction';

    // Create new bid
    const newBid = await bidService.createBid({
      auction_id,
      user_id,
      bid_amount,
    });
    console.log('New bid placed:', newBid);

    // Emit real-time updates to all client
    io.emit('bidUpdates', {
      auction_id,
      bid_amount,
      username,
      title,
      message: `New bid placed: ${bid_amount} XAF by ${username} on "${title}"`,
    });

    {
      /** */
    }
    // Emit real-time notification (excluding the bidder)
    io.emit('newNotification', {
      message: `A new bid of ${bid_amount} XAF has been placed on Auction '${title}' by ${username}!`,
      user_id,
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid', error });
  }
};

// get all auction winner an their auction
export const getAuctionWinners = async (req: Request, res: Response) => {
  try {
    const winners = await fetchAuctionWinnersQuery();
    res.status(200).json(winners);
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    res.status(500).json({ message: 'Failed to fetch auction winners' });
  }
};

export const handleAuctionLifecycle = async (io: any) => {
  try {
    const now = new Date();

    // Update auctions with expired end_date to 'ended'
    const endedAuctions = await updateEndedAuctionsQuery(now);

    if (endedAuctions.length > 0) {
      console.log('Auctions ended:', endedAuctions);

      const winners = await fetchAuctionWinnersQuery();
      console.log('Auction winners:', winners);

      // Notify the winners via Socket.IO
      if (winners.length > 0) {
        winners.forEach(async (winner) => {
          const message = `🎉 Congratulations ${winner.username}! You won the auction for "${winner.auction_title}" with a bid of ${winner.highest_bid} XAF.`;
          console.log(`Sending notification to ${winner.username}: ${message}`);

          io.emit('auctionWinnerNotification', {
            auction_id: winner.auction_id,
            username: winner.username,
            message,
          });
        });

        // Emit the winners' data (optional, in case you want to send this to the frontend)
        io.emit('auctionWinners', winners);
      }
    }
  } catch (error) {
    console.error('Error handling auction lifecycle:', error);
  }
};

// Get auction winners for the authenticated user
export const getUserAuctionWinners = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user_id = parseInt(req.user.id, 10);
    if (isNaN(user_id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    const winners = await fetchUserAuctionWinnersQuery(user_id);
    res.status(200).json(winners);
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    res.status(500).json({ message: 'Failed to fetch auction winners' });
  }
};

// Notify the authenticated user of their auction win
export const handleUserAuctionLifecycle = async (io: any, user_id: number) => {
  try {
    const now = new Date();

    // Update auctions with expired end_date to 'ended'
    const endedAuctions = await updateEndedAuctionsQuery(now);

    if (endedAuctions.length > 0) {
      console.log('Auctions ended:', endedAuctions);

      const winners = await fetchUserAuctionWinnersQuery(user_id); // Get all winners or pass user_id if filtering for specific user

      console.log('Auction winners:', winners);

      // Notify the winners via Socket.IO
      if (winners.length > 0) {
        winners.forEach(async (winner) => {
          const message = `🎉 Congratulations ${winner.username}! You won the auction for "${winner.auction_title}" with a bid of ${winner.highest_bid} XAF.`;
          console.log(`Sending notification to ${winner.username}: ${message}`);

          // Emit to the specific winner
          io.to(winner.user_id.toString()).emit('auctionWinnerNotification', {
            auction_id: winner.auction_id,
            username: winner.username,
            message,
          });
        });

        // Emit the winners' data (optional, in case you want to send this to the frontend)
        io.emit('auctionWinners', winners);
      }
    }
  } catch (error) {
    console.error('Error handling auction lifecycle:', error);
  }
};
