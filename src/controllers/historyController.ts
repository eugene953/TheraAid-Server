import { Request, Response } from 'express';
import { getUserChatSessions } from '../models/historyModel';


export const handleGetUserHistory = async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id); 

  if (isNaN(user_id)) {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  try {
    const sessions = await getUserChatSessions(user_id);
    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ error: "Failed to retrieve user history" });
  }
};
