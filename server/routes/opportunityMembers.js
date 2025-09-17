
// server/routes/opportunityMembers.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // mergeParams is important to get opportunityId

// Assign a member to an opportunity
router.post('/', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { opportunityId } = req.params;
    const { userId } = req.body;

    try {
        await pool.query(
            'INSERT INTO opportunity_members (opportunity_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [opportunityId, userId]
        );
        res.status(201).send({ message: 'Member assigned successfully' });
    } catch (err) {
        console.error('Error assigning member:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Unassign a member from an opportunity
router.delete('/:userId', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { opportunityId, userId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM opportunity_members WHERE opportunity_id = $1 AND user_id = $2',
            [opportunityId, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).send({ message: 'Member unassigned successfully' });
    } catch (err) {
        console.error('Error unassigning member:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
