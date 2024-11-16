import { Request, Response } from 'express';
import { createAuction, getAllAuctions } from '../services/auctionService';
import { Auction } from '../types/auctionTypes';
import { getAuctionById } from '../models/auctionModel';
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

export const getAuctionDetails = async (id: string): Promise<any> => {
  try {
    const auction = await getAuctionById(id); // Fetch auction by ID from database
    return auction;
  } catch (error) {
    throw new Error('Error fetching auction details');
  }
};
