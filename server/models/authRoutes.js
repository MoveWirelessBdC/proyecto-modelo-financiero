// server/routes/authRoutes.js
import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Esto define la ruta POST /api/auth/login
router.post('/login', login);

// Aquí agregaremos la ruta de registro para nuevos usuarios más adelante
// (Será una acción protegida que solo el Asesor Financiero podrá hacer)

export default router;