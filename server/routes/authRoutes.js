
import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// La ruta ahora usa authController.login
router.post('/login', authController.login);

export default router;
