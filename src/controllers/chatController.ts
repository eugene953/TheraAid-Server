import { Request, Response } from 'express';
import axios from 'axios';
import { savechat, startChatSession } from "../services/chatService";


export const handleStartChatSession = async (req: Request, res: Response) => {
    const { user_id } = req.body;
  
    try {
      const session = await startChatSession(user_id);
      res.status(201).json({ session });
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ error: "Failed to start session" });
    }
  };



  export const handleChat = async (req: Request, res: Response) => {
    const { user_id, message, session_id } = req.body;
  
  // Individual error checks
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }
  
    try {
      const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: user_id,
        message: message,
      });
  
      const responseText = rasaResponse.data.map((resp: any) => resp.text).join('\n');
  
      await savechat({ user_id, message, response: responseText, session_id });
  
      res.json({ reply: responseText });
    } catch (error) {
      console.log('Chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }

  };
  


