import { Request, Response } from 'express';
import pool from '../config/database';

export const feedbackController = async (req: Request, res: Response) => {
  const { user_id, rating, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Feedbacks (user_id, rating, message)
        VALUES ($1, $2, $3 ) RETURNING *`,
      [user_id || null, rating || null, message || null]
    );
    res.status(201).json({
      success: true,
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
