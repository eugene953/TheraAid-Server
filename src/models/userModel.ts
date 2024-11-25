import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { UserProps } from '../types/userTypes';

export const userQuery = async (userData: UserProps): Promise<UserProps> => {
  const {
    username,
    email,
    phone_number,
    id_card_number,
    address,
    password,
    confirm_pwd,
    profile,
  } = userData;

  const query = `
  INSERT INTO users (username, email, phone_number, id_card_number, address, password, confirm_pwd, profile)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;

  try {
    // Validating profile and decoding Base64 string
    let profilePath: string | null = null;
    if (profile) {
      if (typeof profile !== 'string' || !profile.startsWith('data:image/')) {
        throw new Error('Invalid profile image format.');
      }

      const base64Data = profile.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid Base64 data in profile image.');
      }

      // Create file path and save the image
      profilePath = `uploads/${username}-profile-${Date.now()}.png`;
      const buffer = Buffer.from(base64Data, 'base64');
      const savePath = path.join(__dirname, '../public', profilePath);

      const directory = path.dirname(savePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      fs.writeFileSync(savePath, buffer);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedConfirmPwd = await bcrypt.hash(confirm_pwd, saltRounds);

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
