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

// POST /api/opportunities/:id/tags - Asignar una etiqueta a una oportunidad
router.post('/:opportunityId/tags', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { opportunityId } = req.params;
    const { tag_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO opportunity_tags (opportunity_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [opportunityId, tag_id]
        );
        res.status(201).send();
    } catch (err) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;
