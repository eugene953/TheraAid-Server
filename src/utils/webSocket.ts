import WebSocket from 'ws';
import pool from '../config/database';
import { sendEmail } from '../controllers/mailer';


type ReminderMessage = {
  activityType: string;
  dayName: string;
  reminderTime: string;
};

const clients: Map<number, WebSocket> = new Map();

export const setupWebSocket = (wss: WebSocket.Server) => {
  wss.on('connection', (ws, req) => {
    const userID = Number(new URL(req.url!, 'http://localhost').searchParams.get('userID'));
    if (!userID || isNaN(userID)) {
        ws.close(); 
        return;
      }
    clients.set(userID, ws);
    console.log(`[WebSocket] Client connected userID=${userID}`);

    ws.on('close', () => {
      clients.delete(userID);
      console.log(`[WebSocket] Client disconnected userID=${userID}`);
    });
  });
};

export const notifyUser = async (userID: number, message: ReminderMessage) => {
  const client = clients.get(userID);

  // Send real-time WebSocket message
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'reminder', payload: message }));
    console.log(`[WebSocket] Notification sent to userID=${userID}:`, message);
  } else {
    console.log(`[WebSocket] Unable to send notification, client not connected or not open for userID=${userID}`);
  }

  try {
    // Fetch user email from the database
    const result = await pool.query('SELECT email, username FROM users WHERE id = $1', [userID]);
    const user = result.rows[0];

    if (user?.email) {
      const subject = '⏰ Reminder from TheraAid';
      const text = `Hello ${user.username}, this is your reminder: ${message.activityType} - ${message.dayName} at ${message.reminderTime}`;
      const html = `
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
  } catch (error) {
    console.error('Failed to send reminder email:', error);
  }
};
