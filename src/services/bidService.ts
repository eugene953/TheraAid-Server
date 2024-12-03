import * as bidModel from '../models/bidModel';
import { bidType } from '../types/bidTypes';

export const createBid = async (bidData: bidType) => {
  try {
    // Validate that the bid is higher than the current highest bid
    const newBid = await bidModel.createBidQuery(bidData);
    return newBid;
  } catch (error) {
    console.error('Error in bidService: ', error);
    throw new Error('Unable to place bid');
  }
};
