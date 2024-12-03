import pool from '../config/database';
import { bidType } from '../types/bidTypes';

export const createBidQuery = async (bidData: bidType): Promise<bidType> => {
  const { auction_id, user_id, bid_amount } = bidData;

  if (!Number.isInteger(user_id)) {
    throw new Error('Invalid user_id. Must be an integer.');
  }

  const query = `INSERT INTO bids (auction_id, user_id, bid_amount, bid_time) 
 VALUES ($1, $2, $3, NOW()) 
 RETURNING *;
 `;
  const values = [auction_id, user_id, bid_amount];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error placing bid:', error);
    throw new Error('Unable to place bid');
  }
};

export const getHighestBid = async (auction_id: number): Promise<number> => {
  const query = `SELECT MAX(bid_amount) as current_bid FROM bids WHERE auction_id = $1;
    `;
  const values = [auction_id];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0]?.current_bid || 0;
  } catch (error) {
    console.error('Error fetching highest bid:', error);
    throw new Error('Unable to retrieve highest bid');
  }
};
