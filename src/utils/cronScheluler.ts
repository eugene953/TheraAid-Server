import cron from 'node-cron';
import { handleAuctionLifecycle } from '../controllers/bidController';

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running auction lifecycle task...');
  await handleAuctionLifecycle();
});
