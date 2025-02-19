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

// Fetch all winners and their auctions won, including seller information to generate report
export const generateReportWinnersQuery = async (
  period: 'weekly' | 'monthly',
  date: string
): Promise<any[]> => {
  const periodQuery =
    period === 'monthly'
      ? `AND EXTRACT(MONTH FROM a.end_date) = EXTRACT(MONTH FROM TO_TIMESTAMP($1, 'YYYY-MM-DD'))`
      : `AND EXTRACT(WEEK FROM a.end_date) = EXTRACT(WEEK FROM TO_TIMESTAMP($1, 'YYYY-MM-DD'))`;

  const query = `
    SELECT 
      b.auction_id,
       u.id AS user_id, --Bidder's user_id
      u.username, 
       u.phone_number, 
       u.email,
      b.bid_amount, 
      a.title ,
      a.end_date,
      a.user_id AS creator_user_id,
      cu.username AS creator_username,
      cu.phone_number AS creator_phone_number
  FROM bids b
  INNER JOIN auctions a ON b.auction_id = a.id
  INNER JOIN users u ON b.user_id = u.id -- Bidder's user details
  INNER JOIN users cu ON a.user_id = cu.id  -- Creator's user details
  WHERE a.end_date <= NOW() 
    AND a.status = 'ended'
    AND b.bid_amount = (
        SELECT MAX(bid_amount) 
        FROM bids 
        WHERE auction_id = b.auction_id
    )
         ${periodQuery}
  ORDER BY a.end_date DESC;
  `;

  try {
    const { rows } = await pool.query(query, [date]);
    return rows.map((row) => ({
      auctionId: row.auction_id || 'N/A',
      userName: row.username || 'N/A',
      auctionTitle: row.title || 'N/A',
      highestBid: String(row.bid_amount || '0'),
      endDate: row.end_date
        ? new Date(row.end_date).toISOString().split('T')[0]
        : 'N/A',
      phoneNumber: row.phone_number || 'N/A',
      sellerUserName: row.creator_username || 'N/A', // seller username
      sellerPhoneNumber: row.creator_phone_number || 'N/A', // seller phone number
    }));
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    throw new Error('Failed to fetch auction winners');
  }
};
