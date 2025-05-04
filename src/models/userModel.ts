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
    password,
    phone_number,
    gender,
  } = userData;

  let profilePath: string | null = null;

    if (file) {
      // Cloudinary automatically uploads via Multer's storage configuration
    profilePath = file.path;
    }
   
try{
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let query: string;
    let values: any[];

    if (profilePath) {
      query = `
        INSERT INTO users (username, email, password, phone_number, gender, profile, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      values = [username, email, hashedPassword, phone_number, gender, profilePath, 'user'];
    } else {
      query = `
        INSERT INTO users (username, email, password, phone_number, gender, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      values = [username, email, hashedPassword, phone_number, gender, 'user'];
    }

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('User registration failed.');
  }
};
