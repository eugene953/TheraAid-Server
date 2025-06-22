import { Request, Response } from 'express';
import pool from '../../config/database';
import { adminQuery } from '../../models/adminModel';

export const registerAdminController = async (req: Request, res: Response) => {
  try {
    const newAdmin = await adminQuery(req.body);

    res.status(201).json({
      success: true,
      admin_id: newAdmin.id,
      username: newAdmin.admin_name,
      email: newAdmin.email,
      role: newAdmin.role,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// get admin details by id
export const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const query = 'SELECT id, admin_name, email FROM admins WHERE id =$1';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'admin not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetch admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

{
  /** Handling users*/
}
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const query = `SELECT id, username, email, phone_number, profile FROM users;`;
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

export const getUserReminderController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = `
    SELECT
    u.username,
    r.activityType,
    r.reminderDay,
    r.reminderTime
    FROM reminders r
    JOIN users u ON r.userID = u.id
     ORDER BY u.username, r.reminderTime;
    `;
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No reminders found for this user' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching reminders', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserFeedbackController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = `
    SELECT
    u.username,
    f.rating,
    f.message
    FROM Feedbacks f
    JOIN users u ON f.user_id = u.id
     ORDER BY u.username, f.message;
    `;
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No feedback found for this user' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching feedback', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

//user engagement
export const getUserEngagementReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = `
      SELECT 
        u.username,
        COUNT(c.session_id) AS total_sessions,
        COALESCE(
          ROUND(AVG(EXTRACT(EPOCH FROM (c.end_time - c.start_time)) / 60), 2),
          0
        ) AS avg_duration_minutes
      FROM chatsession c
      JOIN users u ON c.user_id = u.id
      GROUP BY u.username
      ORDER BY total_sessions DESC;
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error generating engagement report:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
