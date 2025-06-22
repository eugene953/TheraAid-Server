import pool from '../config/database';
import { createChatSession } from '../models/chatSession';
import { ChatMessage } from '../types/chatmessages';

export const startChatSession = async (user_id: number) => {
  return await createChatSession(user_id);
};

export const savechat = async (chat: ChatMessage): Promise<void> => {
  const { user_id, message, response, session_id } = chat;

  await pool.query(
    `INSERT INTO chat_messages(user_id, message, response, session_id)
         VALUES ($1, $2, $3, $4)`,
    [user_id, message, response, session_id]
  );
};

export const getMessagesBySession = async (
  session_id: number
): Promise<ChatMessage[]> => {
  console.log('Getting messages for session ID:', session_id);

  const result = await pool.query(
    `SELECT user_id, message, response, session_id, timestamp 
     FROM Chat_Messages
     WHERE session_id = $1
     ORDER BY timestamp ASC`,
    [session_id]
  );

  console.log('Query result:', result.rows);

  return result.rows;
};
