import { Request, Response } from "express";
import pool from "../config/database";
import { ChatSession } from "../types/chatSession";

// Start or reuse a chat session based on time conditions
export const createChatSession = async (user_id: number): Promise<ChatSession> => {
  const result = await pool.query(
    `SELECT session_id, start_time, end_time, date
     FROM chatsession
     WHERE user_id = $1
     ORDER BY start_time DESC
     LIMIT 1`,
    [user_id]
  );

  const latest = result.rows[0];

  if (latest) {
    const now = new Date();
    const start = new Date(latest.start_time);
    const diffHours = (now.getTime() - start.getTime()) / 1000 / 60 / 60;

    // Reuse session if within 12 hours
    if (diffHours <= 12) {
      return latest;
    }

    // Reuse expired session within 3-hour grace period
    if (diffHours > 12 && diffHours <= 15) {
      return latest;
    }
  }

  // Create new session if no valid reusable session
  const createResult = await pool.query(
    `INSERT INTO chatsession (user_id, start_time, end_time, date)
     VALUES ($1, NOW(), NULL, CURRENT_DATE)
     RETURNING session_id, start_time, end_time, date`,
    [user_id]
  );

  return createResult.rows[0];
};

