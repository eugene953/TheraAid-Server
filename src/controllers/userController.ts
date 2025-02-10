import { Request, Response } from 'express';
import { getUserProfileById, registerUser } from '../services/userService';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { authenticateUser, generateToken } from '../utils/jwtUtils';
import { userQuery } from '../models/userModel';
import { UserProps } from '../types/userTypes';
import otpGenerator from 'otp-generator';
import { sendEmail } from './mailer';

const nodemailer = require('nodemailer');

export const registerUserController = async (req: Request, res: Response) => {
  try {
    console.log('Uploaded File:', req.file);

    const newUser = await registerUser(req.body, req.file);

    const token = generateToken(Number(newUser.id)); // generate token

    // Send a welcome email to the registered user's email
    const subject = 'Welcome to Kako!';
    const text = `Hello ${newUser.username}, welcome to Kako! We're glad to have you.`;
    const html = `<h1>Welcome, ${newUser.username}!</h1><p>Thank you for registering at Kako. You're now ready to start bidding and explore exciting auctions.</p>
                   <p>If you have any questions, feel free to reach out to us at <a href="nfouaeugene@gmail.com">nfouaeugene@gmail.com</a>.</p>
        `;

    // Call the sendEmail function to send the email
    await sendEmail(newUser.email, subject, text, html);

    res.status(201).json({
      success: true,
      user_id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      profile: newUser.profile,

      token,
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

// fetch User by id
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = Number(req.user.id);

    console.log('Authenticated user ID:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const userProfile = await getUserProfileById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.json({ userProfile });
  } catch (error) {
    console.error('Error fetching user profile image:', error);
    return res
      .status(500)
      .json({
        message: 'Failed to fetch user profile image',
        error: 'Unknown error',
      });
  }
};

export const generateOTPController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Email is required' });
    }

    // Store email in session
    req.app.locals.email = email;

    // Check if the email exists in the database
    const userQuery = 'SELECT id, email FROM users WHERE email = $1';
    const { rows } = await pool.query(userQuery, [email]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    req.app.locals.OTP = otp;

    // Send OTP to the user's email
    const subject = 'Your OTP Code';
    const text = `Your OTP code is: ${otp}`;
    const html = `<h3>Your OTP code is: <strong>${otp}</strong></h3>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({
      success: true,
      message: 'OTP sent to the email',
    });
  } catch (error) {
    console.error('Error generating or sending OTP:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyOTPController = async (req: Request, res: Response) => {
  try {
    console.log('Received request:', req.body, req.query);

    // Extract OTP code
    const code = req.body.code || req.query.code;

    if (!code) {
      return res.status(400).json({ error: 'OTP code is required' });
    }

    // Check if OTP exists in app locals
    if (!req.app.locals.OTP) {
      return res.status(400).json({ error: 'No OTP generated or OTP expired' });
    }

    // Compare stored OTP with received code
    if (parseInt(req.app.locals.OTP) === parseInt(code as string)) {
      req.app.locals.OTP = null;
      req.app.locals.resetSession = true;

      return res.status(200).json({ message: 'OTP Verified Successfully!' });
    }

    return res.status(400).json({ error: 'Invalid OTP' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createResetSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    if (req.app.locals.resetSession) {
      return res.status(200).json({ message: 'Reset session active' });
    }
    return res.status(404).json({ error: 'Session expired or invalid' });
  } catch (error) {
    console.error('Error creating reset session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    // Hash the new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Check if email exists in session, email is stored after OTP verification
    const email = req.app.locals.email;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Email not found. Please request OTP first.' });
    }

    // Update the password in the database
    const queryFindAndUpdate = `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING email;
    `;

    const values = [hashPassword, email];
    const { rows } = await pool.query(queryFindAndUpdate, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear session after password reset
    req.app.locals.email = null;
    req.app.locals.resetSession = false;

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
