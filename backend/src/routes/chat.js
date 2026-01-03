import express from 'express';
import { chat, getAnalysis } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', chat);
router.get('/analysis', getAnalysis);

export default router;
