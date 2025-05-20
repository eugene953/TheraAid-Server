import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';

import userRoutes from './routes/userRoutes';
import options from './utils/swaggerConfig';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  createResetSessionController,
  generateOTPController,
  getUserById,
  getUserController,
  getUserProfile,
  registerUserController,
  resetPasswordController,
  updateUserController,
  updateUserProfile,
  verifyOTPController,
} from './controllers/userController';

import Auth, { localVariables } from './middleware/authMiddleware';
import { asyncHandler } from './utils/asyncHandler';
import { upload } from './utils/Cloudinary';


import {
  deleteUserController,
  getAllUsersController,
  registerAdminController,
} from './controllers/adminControllers/adminController';
import { sendEmail } from './controllers/mailer';
import { handleChat, handleStartChatSession } from './controllers/chatController';
import { handleGetUserHistory } from './controllers/historyController';
import chatRoutes from './routes/chatRoutes';
import { feedbackController } from './controllers/Feedback';
import { setupWebSocket } from './utils/webSocket';
import WebSocket from 'ws';
import { createReminder, deleteReminder } from './controllers/reminderController';
import './utils/cronJob';


dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket setup (ws)
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

//middleware
const PORT = Number(process.env.PORT) || 3002;

app.use(cors({ origin: 'http://localhost:3002' }));
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
  async (req: Request, res: Response) => {
    try {
      await registerUserController(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }
);

app.post('/api/users/login', (req: Request, res: Response) => {
  res.send('User API is running!');
});

app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    await getUserController(req, res);
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ message: 'Error fetching user name' });
  }
});


app.get(
 '/user/:id',
  asyncHandler(Auth),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await getUserById(req, res);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Error fetching user details' });
    }
  })
);

// edit details 
app.patch(
  '/user/update-profile',
   asyncHandler(Auth),
   upload.single('profile'),
   asyncHandler(async (req: Request, res: Response): Promise<void> => {
     try {
       await updateUserProfile(req, res);
     } catch (error) {
       console.error('Error fetching user details:', error);
       res.status(500).json({ message: 'Error fetching user details' });
     }
   })
 );

 // feedbacks
 app.post(
  '/api/feedback',
   asyncHandler(Auth),
   asyncHandler(async (req: Request, res: Response): Promise<void> => {
     try {
       await feedbackController(req, res);
     } catch (error) {
       console.error('Error posting feedback:', error);
       res.status(500).json({ message: 'Error giving feedback' });
     }
   })
 );


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
      res.status(500).json({
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
  /**  admin Routes */
}
app.post(
  '/api/adminRegister',

  async (req: Request, res: Response) => {
    try {
      await registerAdminController(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error registering admin', error });
    }
  }
);


{
  /**  chat Routes */
}

app.use('/chat', chatRoutes);

app.post("/startChatSession",
  asyncHandler(Auth),
  asyncHandler(handleStartChatSession)
);

app.post('/api/chat',
  asyncHandler(Auth),
  asyncHandler( async (req: Request, res: Response) => {
    try {
      await handleChat(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error in chat', error });
    }
  })
);

app.get('/chat/history/:user_id', 
  asyncHandler(Auth),
  asyncHandler(handleGetUserHistory)
);

// reminder
app.post(
  '/api/reminder',
  asyncHandler(Auth),
  asyncHandler(
  async (req: Request, res: Response) => {
    try {
      await createReminder(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error creating reminder', error });
    }
  })
);

app.post(
 'api/reminders/:reminderID',
  asyncHandler(Auth),
  asyncHandler(
  async (req: Request, res: Response) => {
    try {
      await deleteReminder(req, res);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Reminder', error });
    }
  })
);

server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
