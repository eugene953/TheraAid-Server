import { Request, Response } from 'express';
import { createAuction, getAllAuctions } from '../services/auctionService';
import { Auction } from '../types/auctionTypes';
import { fetchAuctionById } from '../models/auctionModel';
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
