
// server/routes/activities.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get activities for an opportunity
router.get('/', [authMiddleware, checkPermission('opportunities:view:own')], async (req, res) => {
    const { opportunityId } = req.params;
    try {
        const result = await pool.query(
            `SELECT a.*, u.nombre_completo as user_name 
             FROM activities a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.opportunity_id = $1 
             ORDER BY a.created_at DESC`,
            [opportunityId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add an activity/comment to an opportunity
router.post('/', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { opportunityId } = req.params;
    const { description, type = 'Comment' } = req.body; // Default type to 'Comment'
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO activities (opportunity_id, user_id, description, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [opportunityId, userId, description, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding activity:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
