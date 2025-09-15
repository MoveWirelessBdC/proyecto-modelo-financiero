// server/routes/opportunities.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/opportunities - Obtiene oportunidades según el rol del usuario
router.get('/', [authMiddleware, checkPermission('opportunities:view:own')], async (req, res) => {
    try {
        let queryText = `
                SELECT o.*, c.name as client_name, s.name as stage_name, u.nombre_completo as owner_name,
                (SELECT json_agg(t.*) FROM tags t JOIN opportunity_tags ot ON t.id = ot.tag_id WHERE ot.opportunity_id = o.id) as tags
                FROM opportunities o
                LEFT JOIN clients c ON o.client_id = c.id
                LEFT JOIN pipeline_stages s ON o.stage_id = s.id
                LEFT JOIN users u ON o.owner_id = u.id
            `;
        const queryParams = [];

        if (req.user.rol === 'Team Member') {
            queryText += ' WHERE o.owner_id = $1 GROUP BY o.id, c.name, s.name, u.nombre_completo, s.stage_order ORDER BY s.stage_order ASC, o.created_at DESC';
            queryParams.push(req.user.id);
        } else {
            queryText += ' GROUP BY o.id, c.name, s.name, u.nombre_completo, s.stage_order ORDER BY s.stage_order ASC, o.created_at DESC';
        }

        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching opportunities:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST /api/opportunities - Crea una nueva oportunidad
router.post('/', [authMiddleware, checkPermission('opportunities:create')], async (req, res) => {
    try {
        const { name, potential_amount, client_id, stage_id } = req.body;
        const owner_id = req.user.id;

        const result = await pool.query(
            'INSERT INTO opportunities (name, potential_amount, client_id, stage_id, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, potential_amount || null, client_id, stage_id, owner_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating opportunity:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/opportunities/:id - Actualiza una oportunidad (ej. cambiar de etapa)
router.put('/:id', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, potential_amount, client_id, stage_id } = req.body;

        const result = await pool.query(
            'UPDATE opportunities SET name = $1, potential_amount = $2, client_id = $3, stage_id = $4 WHERE id = $5 RETURNING *',
            [name, potential_amount, client_id, stage_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Oportunidad no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating opportunity:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;