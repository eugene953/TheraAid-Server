import { Request, Response } from 'express';
import pool from '../../config/database';

{
  /** Handling users*/
}
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const query = `SELECT id, username, email, phone_number, id_card_number, address, profile FROM users;`;
    const { rows } = await pool.query(query);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if user exists before deleting
    const checkQuery = 'SELECT * FROM users WHERE id = $1';
    const { rowCount } = await pool.query(checkQuery, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    const deleteQuery = 'DELETE FROM users WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
};

{
  /** Handling auctions*/
}
export const getAllAuctionsController = async (req: Request, res: Response) => {
  try {
    const query = `SELECT  id, title, description, grade, start_bid, start_date,
                      end_date, user_id, image FROM auctions
                      ORDER BY created_at DESC;
                      ;`;
    const { rows: auctions } = await pool.query(query);

    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Error fetching auctions:', error });
  }
};

export const deleteAuctionController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if auction exists before deleting
    const checkQuery = 'SELECT * FROM auctions WHERE id = $1';
    const { rowCount } = await pool.query(checkQuery, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Delete the auction
    const deleteQuery = 'DELETE FROM auctions WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: 'auction deleted successfully' });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
};
