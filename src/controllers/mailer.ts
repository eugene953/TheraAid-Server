import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nfouaeugene953@gmail.com',
    pass: 'lzct dipm zvyk nxuj',
  },
});

// Send mail
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: 'nfouaeugene953@gmail.com',
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

{
  /** 


import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

// Create a transport object using ethereal
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'zackary.trantow@ethereal.email',
    pass: '9n8x1Ehw14XXUVQ8wg',
  },
});

// Create a mail generator
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Mailgen',
    link: 'https://mailgen.js',
  },
});

// Function to send email
export const registerMail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, userEmail, text, subject } = req.body;

    // Validate required fields
    if (!username || !userEmail) {
      console.error('Missing required fields:', { username, userEmail });
      res.status(400).json({ message: 'Username and userEmail are required' });
      return;
    }

    // Define the email structure
    const email = {
      body: {
        name: username,
        intro: 'Welcome to KAKO!',
        text: text || 'Thank you for signing up with us.',
        outro: 'If you have any questions, feel free to reach out.',
      },
    };

    // Generate the email body using Mailgen
    const emailBody = mailGenerator.generate(email);

    // Define the message to be sent
    const message = {
      from: 'zackary.trantow@ethereal.email',
      to: userEmail,
      subject: subject || 'Signup Successful',
      html: emailBody,
    };

    // Send the email
    await transporter.sendMail(message);
    res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};
*/
}
