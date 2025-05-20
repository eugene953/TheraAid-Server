import { Request, Response } from 'express';
import { getUserProfileById, registerUser } from '../services/userService';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import otpGenerator from 'otp-generator';
import { sendEmail } from './mailer';
import { generateToken } from '../middleware/generatetoken';

const nodemailer = require('nodemailer');

export const registerUserController = async (req: Request, res: Response) => {
  try {
    console.log('Uploaded File:', req.file);

    const newUser = await registerUser(req.body, req.file);

    // Pass the object with `id` and `role` to the token generation
    const token = generateToken({ id: Number(newUser.id), role: 'user' });

    // Send a welcome email to the registered user's email
    const subject = 'Welcome to TheraAid!';
    const text = `Hello ${newUser.username}, welcome to TheraAid! We're glad to have you as part of our mental wellness community.`;
    
    const html = `
      <h1>Welcome, ${newUser.username}!</h1>
      <p>Thank you for registering at <strong>TheraAid</strong>. You're now part of a safe space dedicated to supporting mental health through multilingual chat assistance.</p>
      <p>Our chatbot is here 24/7 to listen, support, and guide you in your preferred language.</p>
      <p>If you have any questions or feedback, feel free to contact us at 
         <a href="mailto:nfouaeugene@gmail.com">nfouaeugene@gmail.com</a>.</p>
      <p><strong>You're not alone — we're here for you.</strong></p>
    `;
    
    // Call the sendEmail function to send the email
    await sendEmail(newUser.email, subject, text, html);

    res.status(201).json({
      success: true,
      user_id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      profile: newUser.profile,
      role: newUser.role,

      token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the users table
    const queryUser = `SELECT * FROM users WHERE email = $1`;
    const { rows: userRows } = await pool.query(queryUser, [email]);

    if (userRows.length > 0) {
      const user = userRows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Pass the object with `id` and `role` to the token generation
        const token = generateToken({ id: Number(user.id), role: 'user' });

        return res.status(200).json({
          message: 'Login successful',
          role: 'user',
          user: {
            user_id: user.id,
            email: user.email,
          },
          token,
        });
      } else {
        return res
          .status(401)
          .json({ message: 'email or password' });
      }
    }

    // Check if the admin exists in the admins table
    const queryAdmin = `SELECT * FROM admins WHERE email = $1`;
    const { rows: adminRows } = await pool.query(queryAdmin, [email]);

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (isPasswordValid) {
        // Pass the object with `id` and `role` to the token generation
        const token = generateToken({ id: Number(admin.id), role: 'admin' });

        return res.status(200).json({
          message: 'Login successful',
          role: 'admin',
          user: {
            user_id: admin.id,
            email: admin.email,
          },
          token,
        });
      } else {
        return res
          .status(401)
          .json({ message: 'Invalid email or password' });
      }
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// gets user by user name that when username is enter on the search bar
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
    const { name,email, password, ...filteredData } = rows[0];

    return res.status(200).send(filteredData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).send({ error: 'Internal server error.' });
  }
};

// get user details by id
export const getUserById = async (req: Request, res: Response) => {
  const {id} = req.params;

  try {
    if(!id) {
      return res.status(400).json({error: 'Invalid user ID'});
    }

    const query = 'SELECT id,gender, phone_number, username, email, profile FROM users WHERE id =$1';
    const{rows} = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({error: 'User not found'});
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetch user:', error);
    return res.status(500).json({error: 'Internal server error'});
  }
};


// edit details
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; // assuming `req.user` is populated by auth middleware

  const { username, gender, phone_number } = req.body;
  const file = req.file;

  try {
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }

    if (gender) {
      fields.push(`gender = $${index++}`);
      values.push(gender);
    }

    if (phone_number) {
      fields.push(`phone_number = $${index++}`);
      values.push(phone_number);
    }

    if (file?.path) {
      fields.push(`profile = $${index++}`);
      values.push(file.path);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, username, email, profile, gender, phone_number;
    `;
    values.push(userId);

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
    return res.status(500).json({
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
