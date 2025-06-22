import WebSocket from 'ws';
import { clients } from './notificationReminder';

export const setupWebSocket = (wss: WebSocket.Server) => {
  wss.on('connection', (ws, req) => {
    const userID = Number(
      new URL(req.url!, 'http://localhost').searchParams.get('userID')
    );

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
