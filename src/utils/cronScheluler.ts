import cron from 'node-cron';
import { handleAuctionLifecycle } from '../controllers/bidControllers/bidController';
import { Server } from 'socket.io';

export const startAuctionLifecycleCron = (io: Server) => {
  cron.schedule('* * * * *', async () => {
    console.log('Running auction lifecycle task...');
    await handleAuctionLifecycle(io);
  });
};
