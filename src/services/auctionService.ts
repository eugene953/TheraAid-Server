import { Auction } from '../types/auctionTypes';
import {
  createAuctionQuery,
  fetchAllAuctionsQuery,
} from '../models/auctionModel';

export const createAuction = async (auctionData: Auction): Promise<Auction> => {
  try {
    return await createAuctionQuery(auctionData);
  } catch (error) {
    throw new Error('Error creating auction');
  }
};

export const getAllAuctions = async (): Promise<Auction[]> => {
  try {
    return await fetchAllAuctionsQuery();
  } catch (error) {
    throw new Error('Error fetching auctions');
  }
};
