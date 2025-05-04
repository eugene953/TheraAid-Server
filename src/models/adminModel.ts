import pool from '../config/database';
import { AdminProps } from '../types/adminTypes';
import bcrypt from 'bcrypt';

export const adminQuery = async (
  adminData: AdminProps
): Promise<AdminProps> => {
  const { admin_name, email, password } = adminData;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
   INSERT INTO admins (admin_name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      admin_name,
      email,
      hashedPassword,
      'admin',
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error registering admin:', error);
    throw new Error('Admin registration failed.');
  }
};
