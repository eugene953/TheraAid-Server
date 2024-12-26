import { Request, Response } from 'express';
import { createAuction, getAllAuctions } from '../services/auctionService';
import { Auction } from '../types/auctionTypes';
import {
  fetchAuctionById,
  fetchAuctionsByUserIdQuery,
} from '../models/auctionModel';
import { AuctionResponse } from '../types/auctionTypes';

export const createAuctionController = async (req: Request, res: Response) => {
  try {
    const auctionData: Auction = req.body;
    const newAuction = await createAuction(auctionData);
    return res
      .status(201)
      .json({ message: 'Auction created successfully!', auction: newAuction });
  } catch (error) {
    console.error('Error creating auction:', error);
    return res.status(500).json({ message: 'Error creating auction' });
  }
};

export const getAllAuctionsController = async (req: Request, res: Response) => {
  try {
    const auctions = await getAllAuctions();
    return res.status(200).json({
      message: 'Auctions fetched successfully!',
      auctions,
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return res.status(500).json({ message: 'Error fetching auctions' });
  }
};

export const getAuction = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('Received auction ID:', id);

  // Converting the id to a number
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return res
      .status(400)
      .json({ error: 'Invalid auction ID. ID must be a number.' });
  }

  try {
    const auction = await fetchAuctionById(numericId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.status(200).json(auction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Unable to fetch auction' });
  }
};

export const getAllProductOfUserController = async (
  req: Request,
  res: Response
) => {
  // Extracting user_id from authenticated request object
  const user_id = req.user?.id;

  if (!user_id) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: user ID is missing' });
  }
  console.log('Received user ID:', user_id);

  // Converting user_id to a number
  const numericUserId = parseInt(user_id, 10);

  if (isNaN(numericUserId)) {
    return res
      .status(400)
      .json({ message: 'Invalid user ID. ID must be a number.' });
  }

  try {
    const userAuctions = await fetchAuctionsByUserIdQuery(numericUserId);
    if (!userAuctions || userAuctions.length === 0)
      return res.status(200).json({ auctions: [] });

    const formattedAuctions = userAuctions.map((auction) => ({
      id: auction.id,
      title: auction.auction_title,
      price: auction.start_bid,
      image: auction.image,
      sold: false,
    }));

    return res.status(200).json({ auctions: formattedAuctions });
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    res.status(500).json({ error: 'Unable to fetch user auctions' });
  }
};
