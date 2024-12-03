import { Router } from 'express';
import * as bidController from '../controllers/bidController';

const router = Router();

router.post('/', async (req, res) => {
  try {
    await bidController.placeBid(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid', error });
  }
});

router.get('/test', (req, res) => {
  res.send('Bid API is working!');
});

export default router;
