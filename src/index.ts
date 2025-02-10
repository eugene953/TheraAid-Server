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
  createResetSessionController,
  generateOTPController,
  getUserController,
  getUserProfile,
  resetPasswordController,
  updateUserController,
  verifyOTPController,
} from './controllers/userController';
import Auth, { localVariables } from './middleware/authMiddleware';
import { asyncHandler } from './utils/asyncHandler';
import {
  deleteAuctionByIDController,
  getAllAuctionsController,
  getAllProductOfUserController,
  repostAuction,
  updateAuctionController,
} from './controllers/auctionController';

import { upload } from './utils/Cloudinary';
import {
  getAuctionWinners,
  getUserAuctionWinners,
  handleAuctionLifecycle,
} from './controllers/bidControllers/bidController';
import { startAuctionLifecycleCron } from './utils/cronScheluler';
import { createBid } from './services/bidService';
import {
  deleteAuctionController,
  deleteUserController,
  getAllUsersController,
} from './controllers/adminControllers/adminController';
import { sendEmail } from './controllers/mailer';
// import { registerMail } from './controllers/mailer';

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
app.post(
  '/api/users/register',
  upload.single('profile'),
  (req: Request, res: Response) => {
    res.send('User API is running!');
  }
);

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

app.get(
  '/api/getAllUsers',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllUsersController(req, res);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Error getting all users' });
    }
  }
);

app.delete(
  '/api/deleteUser/:id',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteUserController(req, res);
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
);

// Route to fetch user by ID
app.get(
  '/getUserProfileById/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log('Received ID parameter:', id);
      await getUserProfile(req, res);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      res
        .status(500)
        .json({
          message: 'Failed to fetch user profile',
          error: 'unknown error',
        });
    }
  })
);

app.post(
  '/generateOTP',
  asyncHandler(localVariables),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await generateOTPController(req, res);
    } catch (error) {
      console.error('Error generating OTP:', error);
      res.status(500).json({ message: 'Error generating OTP' });
    }
  })
);

app.post('/verifyOTP', async (req: Request, res: Response): Promise<void> => {
  try {
    await verifyOTPController(req, res);
  } catch (error) {
    console.error('Error verifying OTP', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

app.post(
  '/createResetSession',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await createResetSessionController(req, res);
    } catch (error) {
      console.error('Error verifying OTP', error);
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  }
);

/** PUT methods */
app.put(
  '/resetPassword',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await resetPasswordController(req, res);
    } catch (error) {
      console.error('Error verifying OTP', error);
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  }
);

app.post('/send-email', async (req: Request, res: Response): Promise<void> => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text || !html) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    const response = await sendEmail(to, subject, text, html);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error sending email' });
  }
});

{
  /**  
   app.post( '/registerMail',
    async (req: Request, res: Response): Promise<void> => {
       try {
         await registerMail(req, res);
       } catch (error) {
         console.error('Error registering mail', error);
         res.status(500).json({ message: 'Error registering mail' });
       }
     });
*/
}

{
  /**  Auction Routes post, get and getting by id , delete  */
}
app.use('/api/auctions', auctionRoutes);

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
      res.status(500).json({
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
      res.status(500).json({
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

/** get methods */
app.get(
  '/api/getAllAuctions',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllAuctionsController(req, res);
    } catch (error) {
      console.error('Error getting all auctions:', error);
      res.status(500).json({ message: 'Error getting all auctions' });
    }
  }
);

app.delete(
  '/api/deleteAuction/:id',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteAuctionController(req, res);
    } catch (error) {
      console.error('Error deleting auction:', error);
      res.status(500).json({ message: 'Error deleting auction' });
    }
  }
);

{
  /**  bid Routes */
}
app.use('/api/bids', bidRoutes);

// get all auction-winner
app.get('/auction-winner', async (req: Request, res: Response) => {
  try {
    await getAuctionWinners(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions winner', error });
  }
});

// get a particular auction-winner
app.get(
  '/UserAuctionWinner',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await getUserAuctionWinners(req, res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching user auctions won', error });
    }
  })
);

// Set up Socket.IO event listeners
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  {
    /**
    // test works: Emit a test 'auctionWinnerNotification' after the client connects
    setTimeout(() => {
      socket.emit('auctionWinnerNotification', {
        auction_id: 123,
        username: 'Melinda',
        message: 'You have won the auction!',
      });
    }, 2000);
 */
  }

  // cron job which run every minute, send winner notification
  startAuctionLifecycleCron(io);

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// handle import to io and bidUpdates
export { io };

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
