import pool from '../config/database';

export const getUserChatSessions = async (user_id: number): Promise<any[]> => {
  const result = await pool.query(
    `SELECT
        cs.session_id,
        cs.start_time,
        cs.date,
        cm.message,
        cm.timestamp AS message_timestamp
     FROM ChatSession cs
     JOIN Chat_Messages cm ON cs.session_id = cm.session_id
     WHERE cm.user_id = $1
     ORDER BY cs.date DESC`,
    [user_id]
  );
  return result.rows;
};
