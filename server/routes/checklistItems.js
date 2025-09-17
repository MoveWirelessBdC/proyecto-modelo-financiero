
// server/routes/checklistItems.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Get checklist for an opportunity
router.get('/opportunities/:opportunityId/checklist', [authMiddleware, checkPermission('opportunities:view:own')], async (req, res) => {
    const { opportunityId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM checklist_items WHERE opportunity_id = $1 ORDER BY created_at ASC',
            [opportunityId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching checklist:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a checklist item
router.post('/opportunities/:opportunityId/checklist', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { opportunityId } = req.params;
    const { text } = req.body;
    const created_by = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO checklist_items (opportunity_id, text, created_by) VALUES ($1, $2, $3) RETURNING *',
            [opportunityId, text, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding checklist item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a checklist item (toggle complete, edit text)
router.put('/checklist/:itemId', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { itemId } = req.params;
    const { text, is_completed } = req.body;

    // Build query dynamically
    const fields = [];
    const values = [];
    let query = 'UPDATE checklist_items SET ';

    if (text !== undefined) {
        fields.push('text = $' + (fields.length + 1));
        values.push(text);
    }
    if (is_completed !== undefined) {
        fields.push('is_completed = $' + (fields.length + 1));
        values.push(is_completed);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    query += fields.join(', ') + ' WHERE id = $' + (fields.length + 1) + ' RETURNING *';
    values.push(itemId);

    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating checklist item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a checklist item
router.delete('/checklist/:itemId', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query('DELETE FROM checklist_items WHERE id = $1', [itemId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting checklist item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;
