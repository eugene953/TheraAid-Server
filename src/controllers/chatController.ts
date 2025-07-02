import { Request, Response } from 'express';
import axios from 'axios';
import {
  getMessagesBySession,
  savechat,
  startChatSession,
} from '../services/chatService';
import pool from '../config/database';
import { sendEmail } from './mailer';
import { notifyUser } from '../utils/notificationReminder';

export const handleStartChatSession = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  try {
    const session = await startChatSession(user_id);
    res.status(201).json({ session });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

export const handleChat = async (req: Request, res: Response) => {
  const { user_id, message, session_id } = req.body;

  if (!user_id || !message || !session_id) {
    return res
      .status(400)
      .json({ error: 'user_id, message, and session_id are required' });
  }

  try {
    // Send message to Rasa
    const rasaResponse = await axios.post(
      'http://localhost:5005/webhooks/rest/webhook',
      {
        sender: user_id,
        message: message,
      }
    );

    const responseText = rasaResponse.data
      .map((resp: any) => resp.text)
      .join('\n');

    // Save chat to DB
    await savechat({ user_id, message, response: responseText, session_id });

    // ✅ Only check if any Rasa response includes 'Ya ki pei ta si fou shi, A ne ya tomcorn na professionals (suicider thoughts)' and refer the user to
    const rasaTexts = rasaResponse.data
      .map((r: any) => r.text?.toLowerCase())
      .filter(Boolean);

   const referralTriggerPhrase = 'ya ki pei ta si fou shi, a ne ya tomcorn na professionals';

const needsReferral = rasaTexts.some((text: string) =>
  text.replace(/\s+/g, ' ').trim().includes(referralTriggerPhrase)
);

    if (needsReferral) {
      const userResult = await pool.query(
        'SELECT email, username FROM users WHERE id = $1',
        [user_id]
      );

      if (userResult.rows.length === 0) {
        console.warn(`[Referral] No user found with ID ${user_id}`);
      } else {
        const userEmail = userResult.rows[0].email;
        const username = userResult.rows[0].username;

        const proResult = await pool.query(
          `SELECT * FROM professionals WHERE $1 = ANY(languages) AND available = true LIMIT 1`,
          ['Kissam']
        );

        if (proResult.rows.length > 0) {
          const professional = proResult.rows[0];

          const infoMessage = `
A professional is available to support you:

👤 Name: ${professional.full_name}
🧠 Specialization: ${professional.specialization}
📧 Email: ${professional.contact_email}
📞 Phone: ${professional.phone_number}
📍 Region: ${professional.region}
          `.trim();

          // 📲 Real-time notification
          await notifyUser(
            user_id,
            {
              title: 'Mental Health Referral',
              body: infoMessage,
              timestamp: new Date().toISOString(),
            },
            "Important: You've been referred to a professional",
            `<h2>Support is available</h2><p>${infoMessage.replace(
              /\n/g,
              '<br/>'
            )}</p>`
          );

          // 📧 Email referral
          await sendEmail(
            userEmail,
            'Mental Health Support Referral',
            infoMessage,
            `<p>Dear ${username},</p>
            <p>Based on your recent interaction, we recommend speaking to a professional:</p>
            <ul>
              <li><strong>Name:</strong> ${professional.full_name}</li>
              <li><strong>Specialization:</strong> ${professional.specialization}</li>
              <li><strong>Email:</strong> ${professional.contact_email}</li>
              <li><strong>Phone:</strong> ${professional.phone_number}</li>
              <li><strong>Region:</strong> ${professional.region}</li>
            </ul>
            <p>Please feel free to reach out for help. You are not alone.</p>
            <p><em>- TheraAid Team</em></p>`
          );
        } else {
          console.warn(`[Referral] No available professionals found.`);
        }
      }
    }

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const handleGetMessagesBySession = async (
  req: Request,
  res: Response
) => {
  const { session_id } = req.params;

  try {
    const messages = await getMessagesBySession(Number(session_id));
    res.status(200).json({ messages });
  } catch (error: any) {
    console.error('Failed to retrieve messages:', error.message || error);
    res.status(500).json({ error: 'Could not retrieve messages' });
  }
};
