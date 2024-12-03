import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import auctionRoutes from './routes/auctionRoutes';
import userRoutes from './routes/userRoutes';
import { getAllAuctions } from './services/auctionService';

dotenv.config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.disable('x-powered-by');

// user authentication
app.use('/api/users', userRoutes);

app.post('/api/users/register', (req: Request, res: Response) => {
  res.send('User API is running!');
});

/** Auction post, get and getting by id   */
app.use('/api/auctions', auctionRoutes);

app.post('/api/auctions/create', (req: Request, res: Response) => {
  res.send('Auction API is running!');
});

app.get('/api/auctions/fetch', async (req, res) => {
  try {
    const auctions = await getAllAuctions();
    res.status(200).json({ auctions }); // Send auctions data
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Error fetching auctions' });
  }
});

app.get('/api/auctions/fetch/:id', (req: Request, res: Response) => {
  res.send('Auction API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
