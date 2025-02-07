import pool from '../config/database';
import { bidType } from '../types/bidTypes';

export const createBidQuery = async (bidData: bidType): Promise<bidType> => {
  const { user_id, auction_id, bid_amount } = bidData;

  if (!Number.isInteger(user_id)) {
    throw new Error('Invalid user_id. Must be an integer.');
  }
  console.log('Creating bid with data:', bidData);

  // check if auction exists and get the creator_id
  const auctionQuery = 'SELECT * FROM auctions WHERE id = $1';
  const result = await pool.query(auctionQuery, [auction_id]);

  if (result.rows.length === 0) {
    throw new Error(`Auction with ID ${auction_id} does not exist.`);
  }

  const auction = result.rows[0];

  // Check if the user is the creator of the auction
  if (auction.creator_id === user_id) {
    throw new Error('You cannot place a bid on an auction you created.');
  }

  const query = `INSERT INTO bids (user_id, auction_id,  bid_amount, bid_time) 
 VALUES ($1, $2, $3, NOW()) 
 RETURNING *;
 `;
  const values = [user_id, auction_id, bid_amount];

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

// fetch all winner and their auction won
export const fetchAuctionWinnersQuery = async (): Promise<any[]> => {
  const query = `
  SELECT 
    b.auction_id,
     u.id AS user_id, 
    u.username, 
     u.phone_number, 
     u.email,
    b.bid_amount AS highest_bid, 
    a.title AS auction_title,
    a.end_date
FROM bids b
INNER JOIN auctions a ON b.auction_id = a.id
INNER JOIN users u ON b.user_id = u.id
WHERE a.end_date <= NOW() 
  AND a.status = 'ended'
  AND b.bid_amount = (
      SELECT MAX(bid_amount) 
      FROM bids 
      WHERE auction_id = b.auction_id
  )
ORDER BY a.end_date DESC;
`;

  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    throw new Error('Failed to fetch auction winners');
  }
};

export const updateEndedAuctionsQuery = async (
  currentDate: Date
): Promise<any[]> => {
  const query = `
    UPDATE auctions
    SET status = 'ended'
    WHERE end_date <= $1 AND status != 'ended'
    RETURNING id, title;
  `;

  try {
    const { rows } = await pool.query(query, [currentDate]);
    return rows;
  } catch (error) {
    console.error('Error updating ended auctions:', error);
    throw new Error('Failed to update auction statuses');
  }
};

// fetch a winner and their auction won by user_id
export const fetchUserAuctionWinnersQuery = async (
  userId: number
): Promise<any[]> => {
  const query = `
    SELECT 
           b.auction_id,
      u.id AS user_id, 
      u.username, 
      u.phone_number, 
      u.email,
      b.bid_amount AS highest_bid, 
      a.title AS auction_title,
      a.image,
      a.end_date
    FROM bids b
    INNER JOIN auctions a ON b.auction_id = a.id
    INNER JOIN users u ON b.user_id = u.id
    WHERE a.end_date <= NOW() 
      AND a.status = 'ended'
      AND b.bid_amount = (
        SELECT MAX(bid_amount) 
        FROM bids 
        WHERE auction_id = b.auction_id
      )
      AND b.user_id = $1  -- Filter by user_id
    ORDER BY a.end_date DESC;

  `;
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    throw new Error('Failed to fetch auction winners');
  }
};
