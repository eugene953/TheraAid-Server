import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import auctionRoutes from './routes/auctionRoutes';
import userRoutes from './routes/userRoutes';
import bidRoutes from './routes/bidRoutes';
import { getAllAuctions } from './services/auctionService';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

{
  /** user authentication Routes */
}
app.use('/api/users', userRoutes);

app.post('/api/users/register', (req: Request, res: Response) => {
  res.send('User API is running!');
});

app.post('/api/users/login', (req: Request, res: Response) => {
  res.send('User API is running!');
});

{
  /**  Auction Routes post, get and getting by id   */
}
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

{
  /**  bid Routes */
}
app.use('/api/bids', bidRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Set up Socket.IO event listeners
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for bid updates from clients (if needed)
  socket.on('sendBid', (data) => {
    console.log('Bid received:', data);
    io.emit('bidUpdates', data);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
