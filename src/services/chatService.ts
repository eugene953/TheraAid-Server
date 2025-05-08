import pool from "../config/database";
import { ChatMessage } from "../types/chatmessages";

export const savechat = async (chat: ChatMessage): Promise<void> => {
    const {user_id, message, response} = chat;

    await pool.query(
        `INSERT INTO chat_messages(user_id, message, response) VALUES ($1, $2, $3)`,
         [user_id, message, response]
    );
};