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
export const getAuctionById = async (id: string): Promise<Auction | null> => {
  try {
    const result = await pool.query('SELECT * FROM auctions WHERE id = $1', [
      id,
    ]);
    if (result.rows.length === 0) {
      return null;
    }

    const auction = result.rows[0];
    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      category: auction.category,
      start_bid: auction.start_bid,
      grade: auction.grade,
      start_date: auction.start_date,
      end_date: auction.end_date,
      image: auction.image,
    };
  } catch (error) {
    console.error('Error fetching auction:', error);
    throw new Error('Unable to fetch auction');
  }
};
