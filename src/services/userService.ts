import pool from '../config/database';
import { userQuery } from '../models/userModel';
import { UserProps } from '../types/userTypes';

// register
export const registerUser = async (
  userData: UserProps,
  file?: Express.Multer.File
): Promise<UserProps> => {
  const { email, password } = userData;

  // Check for unique email
  const emailQuery = 'SELECT * FROM users WHERE email = $1';
  const { rowCount: emailExists } = await pool.query(emailQuery, [email]);
  if (emailExists) {
    throw new Error('Email is already registered');
  }

  return await userQuery(userData, file);
};

export const getUserProfileById = async (
  userId: number
): Promise<UserProps | null> => {
  try {
    const query = `
      SELECT *
      FROM users
      WHERE id = $1;
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching user profile image by ID:', error);
    throw new Error('Failed to fetch user profile image');
  }
};
