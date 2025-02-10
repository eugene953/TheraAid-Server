import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { UserProps } from '../types/userTypes';
import { upload } from '../utils/Cloudinary';

export const userQuery = async (
  userData: UserProps,
  file?: Express.Multer.File
): Promise<UserProps> => {
  const {
    username,
    email,
    phone_number,
    id_card_number,
    address,
    password,
    confirm_password,
  } = userData;

  let profilePath: string | null = null;

  try {
    if (!file) {
      throw new Error('Profile image upload is required');
    }

    // Cloudinary automatically uploads via Multer's storage configuration
    profilePath = file.path;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedConfirmPwd = await bcrypt.hash(confirm_password, saltRounds);

    const query = `
  INSERT INTO users (username, email, phone_number, id_card_number, address, password, confirm_password, profile)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8 )
  RETURNING *;
`;

    const values = [
      username,
      email,
      phone_number,
      id_card_number,
      address,
      hashedPassword,
      hashedConfirmPwd,
      profilePath,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('User registration failed.');
  }
};
