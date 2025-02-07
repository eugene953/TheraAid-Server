import { Request, Response } from 'express';
import { createAuction, getAllAuctions } from '../services/auctionService';
import { Auction } from '../types/auctionTypes';
import {
  createAuctionQuery,
  deleteAuctionByIDQuery,
  fetchAuctionById,
  fetchAuctionsByUserIdQuery,
} from '../models/auctionModel';
import { upload } from '../utils/Cloudinary';
import { AuctionResponse } from '../types/auctionTypes';
import pool from '../config/database';

export const createAuctionController = async (req: Request, res: Response) => {
  try {
    const auctionData: Auction = req.body;

    // Get user_id from the decoded token
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Check if the user exists in the database
    const userQuery = 'SELECT id FROM users WHERE id = $1';
    const { rows: userRows } = await pool.query(userQuery, [user_id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    auctionData.user_id = Number(user_id);

    // Retrieve the uploaded file URL from Cloudinary
    if (req.file && req.file.path) {
      auctionData.image = req.file.path;
    } else {
      return res.status(400).json({ message: 'Image upload is required' });
    }

    auctionData.start_bid = Number(auctionData.start_bid);
    if (isNaN(auctionData.start_bid)) {
      return res.status(400).json({ message: 'Invalid start_bid value' });
    }

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
      end_date: auction.end_date,
      sold: false,
    }));

    return res.status(200).json({ auctions: formattedAuctions });
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    res.status(500).json({ error: 'Unable to fetch user auctions' });
  }
};

export const deleteAuctionByIDController = async (
  req: Request,
  res: Response
) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed!' });
    }

    const { id } = req.params;

    // Convert the id to a number
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ message: 'Invalid auction ID. ID must be a number.' });
    }

    // Fetch the auction from the database
    const auction = await fetchAuctionById(numericId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    {
      /** 
       // Check if the current user is the owner of the auction
       if (String(auction.user_id) !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this auction' });
      }  
      */
    }
    await deleteAuctionByIDQuery(numericId);
    return res.status(200).json({ message: 'Auction deleted successfully!' });
  } catch (error) {
    console.log('Error deleting auction:', error);
    return res.status(500).json({ message: 'Error deleting auction' });
  }
};

export const updateAuctionController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, start_bid, status, start_date, end_date } =
    req.body;

  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid auction ID' });
    }

    // Check if the auction exists
    const checkQuery = 'SELECT * FROM auctions WHERE id = $1';
    const { rows: auctionRows } = await pool.query(checkQuery, [numericId]);

    if (auctionRows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const updateQuery = `
     UPDATE auctions 
     SET title = $1, description = $2, start_bid = $3, status = $4, start_date = $5, end_date = $6 
     WHERE id = $7 RETURNING *;
   `;
    const { rows } = await pool.query(updateQuery, [
      title,
      description,
      start_bid,
      status,
      start_date,
      end_date,
      numericId,
    ]);

    return res
      .status(200)
      .json({ message: 'Auction updated successfully', auction: rows[0] });
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const repostAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { end_date, start_date } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid auction ID provided.' });
    }

    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: 'Start and end dates are required.' });
    }

    const checkQuery = 'SELECT status FROM auctions WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    const currentStatus = checkResult.rows[0].status;

    if (currentStatus !== 'ended') {
      return res
        .status(400)
        .json({ message: 'Only ended auctions can be reposted' });
    }

    const now = new Date();
    let newStatus: 'upcoming' | 'active' =
      new Date(start_date) > now ? 'upcoming' : 'active';

    const query = `
      UPDATE auctions
      SET start_date = $1, end_date = $2, status = $3
      WHERE id = $4
      RETURNING id, start_date, end_date, status;
    `;
    const values = [start_date, end_date, newStatus, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    return res.status(200).json({
      message: 'Auction reposted successfully',
      auction: {
        id: rows[0].id,
        start_date: rows[0].start_date,
        end_date: rows[0].end_date,
        status: rows[0].status,
      },
    });
  } catch (error) {
    console.error('Error reposting auction:'); // Avoid logging circular structures
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
