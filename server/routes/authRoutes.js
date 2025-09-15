
import express from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// La ruta ahora usa authController.login
router.post('/login', authController.login);

// Nueva ruta para obtener el perfil del usuario
router.get('/me', authMiddleware, authController.getMe);

export default router;
