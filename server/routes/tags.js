// server/routes/tags.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tags - Obtener todas las etiquetas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tags');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST /api/tags - Crear una nueva etiqueta
router.post('/', [authMiddleware, checkPermission('tags:manage')], async (req, res) => {
    const { name, color } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tags (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
            [name, color, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;
