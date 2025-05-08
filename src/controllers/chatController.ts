import { Request, Response } from 'express';
import axios from 'axios';
import { savechat } from "../services/chatService";


export const handleChat = async (req:Request, res: Response) => {
    const {user_id, message} = req.body;

try{
    const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: user_id,
      message: message,
    });

    const responseText = rasaResponse.data.map((resp: any) => resp.text).join('\n');

    await savechat({user_id, message, response: responseText});

    res.json({reply: responseText});  

} catch (error) {
    console.log('chat Error', error);
    res.status(500).json({error: 'Failed to process message'})

}



}