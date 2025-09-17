// server/routes/authRoutes.js
import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;