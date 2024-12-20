import { Request, Response } from 'express';
import { registerUser } from '../services/userService';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { authenticateUser, generateToken } from '../utils/jwtUtils';
import { userQuery } from '../models/userModel';

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const newUser = await registerUser(req.body);

    const token = generateToken(Number(newUser.id)); // generate token

    res.status(201).json({
      success: true,
      user_id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      token, // return token
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // check  if username exist in database
    const query = `SELECT * FROM users WHERE username = $1`;
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Comparing passwords...');

    const user = rows[0];
    // Comparing provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Authenticate and generate JWT
    const token = generateToken(Number(user.id));
    console.log('authenticate and generate JWT:', token);

    // Returning login success with token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error login user', error });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).send({ error: 'Invalid Username' });
    }

    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).send({ error: 'User not found' });
    }

    //  Destructuring  id_card_number, password, confirm_pwd
    const { id_card_number, password, confirm_pwd, ...filteredData } = rows[0];

    return res.status(200).send(filteredData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    // const id = req.query.id;

    // Extract the ID and convert it to an integer
    const id = req.user?.id ? parseInt(req.user.id, 10) : null;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid User ID is required!' });
    }

    const { username, email, phone_number, address, profile } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required!' });
    }

    // update user in database
    const query = `
  UPDATE users
  SET username = $1, email = $2, phone_number = $3, address = $4, profile = $5
  WHERE id = $6
  RETURNING *;
`;

    const values = [username, email, phone_number, address, profile, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'User not found!' });
    }

    return res
      .status(200)
      .send({ msg: 'User record Updated successfully...!' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).send({ error: 'Internal server error!' });
  }
};

export const generateOTPController = async (req: Request, res: Response) => {
  res.json('generateOTP route');
};

export const verifyOTPController = async (req: Request, res: Response) => {
  res.json('verifyOTP route');
};

export const createResetSessionController = async (
  req: Request,
  res: Response
) => {
  res.json('createResetSession route');
};

export const resetPasswordController = async (req: Request, res: Response) => {
  res.json('resetPassword route');
};
