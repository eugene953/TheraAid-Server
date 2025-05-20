import pool from "../config/database";
import { createChatSession } from "../models/chatSession";
import { ChatMessage } from "../types/chatmessages";



export const startChatSession = async (user_id: number) => {
    return await createChatSession(user_id);
  };


export const savechat = async (chat: ChatMessage): Promise<void> => {
    const {user_id, message, response, session_id} = chat;

    await pool.query(
        `INSERT INTO chat_messages(user_id, message, response, session_id)
         VALUES ($1, $2, $3, $4)`,
         [user_id, message, response, session_id]
    );
};