import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';

import auctionRoutes from './routes/auctionRoutes';
import userRoutes from './routes/userRoutes';
import bidRoutes from './routes/bidRoutes';
import { getAllAuctions } from './services/auctionService';
import options from './utils/swaggerConfig';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  getUserController,
  updateUserController,
} from './controllers/userController';
import Auth from './middleware/authMiddleware';
import { asyncHandler } from './utils/asyncHandler';
import {
  deleteAuctionByIDController,
  getAllProductOfUserController,
  repostAuction,
  updateAuctionController,
} from './controllers/auctionController';

import * as bidController from './controllers/bidController';

import { upload } from './utils/Cloudinary';
import { getAuctionWinners } from './controllers/bidController';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Swagger setup
const swaggerDocs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    await getUserController(req, res);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Error fetching auctions' });
  }
});

app.put(
  '/api/updateUser',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await updateUserController(req, res);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      res.status(500).json({ message: 'Error fetching auctions' });
    }
  })
);

{
  /**  Auction Routes post, get and getting by id , delete  */
}
app.use('/api/auctions', auctionRoutes);

{
  /**
const uploadDir = path.join(__dirname, 'src', 'middleware', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created:', uploadDir);
}
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
 */
}
app.post(
  '/api/auctions/create',
  asyncHandler(Auth),
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    res.send('Auction API is running!');
  })
);

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

app.get(
  '/api/user',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const data = await getAllProductOfUserController(req, res);
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error fetching auctions:', error);
      res.status(500).json({ message: 'Error fetching auctions' });
    }
  })
);

// Delete auction route
app.delete(
  '/auctions/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteAuctionByIDController(req, res);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'An unexpected error occurred during deletion',
          error,
        });
    }
  })
);

// update auction route
app.put(
  '/auctions/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await updateAuctionController(req, res);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'An unexpected error occurred during auction update',
          error,
        });
    }
  })
);

// repost auction route
app.put(
  '/repost/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response) => {
    return repostAuction(req, res); 
  })
);

{ /**  bid Routes */}
app.use('/api/bids', bidRoutes);

app.get('/auction-winner', async (req: Request, res: Response) => {
  try {
    await bidController.getAuctionWinners(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions winner', error });
  }
});


// Set up Socket.IO event listeners
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Handle bid event
  socket.on('sendBid', (data) => {
    console.log('Bid received:', data);
    io.emit('bidUpdates', data);
  });

  // Handle notification event
  socket.on('newNotification', (data) => {
    console.log('Notification received:', data);
    io.emit('newNotification', data);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
