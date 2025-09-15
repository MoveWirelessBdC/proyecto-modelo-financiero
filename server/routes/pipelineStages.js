// server/routes/pipelineStages.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stages - Obtiene todas las etapas del pipeline
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pipeline_stages ORDER BY stage_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching pipeline stages:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;
