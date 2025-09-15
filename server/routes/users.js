// server/routes/users.js
import express from 'express';
import pool from '../db/index.js';
import bcrypt from 'bcryptjs';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Obtiene todos los usuarios
router.get('/', [authMiddleware, checkPermission('users:view')], async (req, res) => {
    try {
        const users = await pool.query('SELECT u.id, u.nombre_completo, u.email, r.nombre_rol FROM users u JOIN roles r ON u.rol_id = r.id ORDER BY u.id');
        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /api/users - Crea un nuevo usuario
router.post('/', [authMiddleware, checkPermission('users:create')], async (req, res) => {
    const { nombre_completo, email, password, rol_id } = req.body;
    if (!nombre_completo || !email || !password || !rol_id) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (nombre_completo, email, password_hash, rol_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo, email',
            [nombre_completo, email, passwordHash, rol_id]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Error de email duplicado
            return res.status(400).json({ message: 'El email ya está en uso.' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
