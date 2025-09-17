// server/routes/stages.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET all stages (ya existe en otro archivo, pero lo mantenemos por completitud)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM pipeline_stages ORDER BY stage_order ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST - Crear una nueva etapa
router.post('/', [authMiddleware, checkPermission('stages:edit')], async (req, res) => {
    const { name } = req.body;
    try {
        // Obtener el máximo stage_order y sumarle 1
        const maxOrderRes = await pool.query('SELECT MAX(stage_order) as max_order FROM pipeline_stages');
        const newOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

        const { rows } = await pool.query(
            'INSERT INTO pipeline_stages (name, stage_order) VALUES ($1, $2) RETURNING *',
            [name, newOrder]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating stage:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT - Editar el nombre de una etapa
router.put('/:id', [authMiddleware, checkPermission('stages:edit')], async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE pipeline_stages SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('Error updating stage:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE - Archivar una etapa (soft delete)
router.delete('/:id', [authMiddleware, checkPermission('stages:edit')], async (req, res) => {
    const { id } = req.params;
    await pool.query('UPDATE pipeline_stages SET is_archived = true WHERE id = $1', [id]);
    res.status(204).send();
});

export default router;