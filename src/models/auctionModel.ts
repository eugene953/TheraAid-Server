import pool from '../config/database';
import { Auction } from '../types/auctionTypes';

export const createAuctionQuery = async (
  auctionData: Auction
): Promise<Auction> => {
  const {
    title,
    description,
    category,
    grade,
    start_bid,
    start_date,
    end_date,
    image,
  } = auctionData;
  const query = `
    INSERT INTO auctions (title, description, category, grade, start_bid, start_date, end_date, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    title,
    description,
    category,
    grade,
    start_bid,
    start_date,
    end_date,
    image,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const fetchAllAuctionsQuery = async (): Promise<Auction[]> => {
  const query = 'SELECT * FROM auctions';
  const { rows } = await pool.query(query);
  return rows;
};

// getting auction details by ID
export const fetchAuctionById = async (id: number): Promise<Auction | null> => {
  try {
    const query = 'SELECT * FROM auctions WHERE id = $1';
    const values = [id]; // Using the numeric ID here
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching auction by ID:', error);
    throw error;
  }
};

// getting auction details by user ID
export const fetchAuctionsByUserIdQuery = async (userId: number) => {
  try {
    const query = ` SELECT 
        a.id, 
        a.title AS auction_title, 
        a.start_bid, 
        a.image
       FROM auctions AS a
      INNER JOIN bids AS b ON a.id = b.auction_id
      WHERE b.user_id = $1;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching auctions by user ID:', error);
    throw new Error('Database query failed');
  }
};
