import pool from '../config/database';
import { userQuery } from '../models/userModel';
import { UserProps } from '../types/userTypes';

// register
export const registerUser = async (userData: UserProps): Promise<UserProps> => {
  const { username, email } = userData;

  // Check for unique email
  const emailQuery = 'SELECT * FROM users WHERE email = $1';
  const { rowCount: emailExists } = await pool.query(emailQuery, [email]);
  if (emailExists) {
    throw new Error('Email is already registered');
  }

  if (userData.password !== userData.confirm_pwd) {
    throw new Error('Password do not match');
  }

  return await userQuery(userData);
};
