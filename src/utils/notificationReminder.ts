import WebSocket from 'ws';
import pool from '../config/database';
import { sendEmail } from '../controllers/mailer';

export const clients: Map<number, WebSocket> = new Map();

export interface NotificationMessage {
  title: string;
  body: string;
  timestamp: string;
  activityType?: string;
  dayName?: string;
  reminderTime?: string;
}

export const notifyUser = async (
  userID: number,
  message: NotificationMessage,
  emailSubject?: string,
  emailHTML?: string
) => {
  const client = clients.get(userID);

  // Send WebSocket message
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'notification', payload: message }));
    console.log(`[WebSocket] Notification sent to userID=${userID}:`, message);
  } else {
    console.log(
      `[WebSocket] Cannot notify: WebSocket not open for userID=${userID}`
    );
  }

  try {
    // Fetch user email
    const { rows } = await pool.query(
      'SELECT email, username FROM users WHERE id = $1',
      [userID]
    );
    const user = rows[0];

    if (user?.email) {
      const subject = emailSubject || '⏰ Reminder from TheraAid';
      const text = `Hello ${user.username}, this is your reminder: ${message.activityType} - ${message.dayName} at ${message.reminderTime}`;
      const html =
        emailHTML ||
        `
          <h2>⏰ Hello ${user.username}!</h2>
          <p>This is your scheduled reminder from <strong>TheraAid</strong>:</p>
          <blockquote>
            <strong>${message.activityType}</strong><br/>
            ${message.dayName} at ${message.reminderTime}
          </blockquote>
          <p>Stay well,</p>
          <p>The TheraAid Team Cares</p>
        `;

      await sendEmail(user.email, subject, text, html);
    }
  } catch (err) {
    console.error('[Email] Failed to send notification email:', err);
  }
};
