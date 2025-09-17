
// server/routes/opportunities.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/opportunities - Obtiene oportunidades según el rol del usuario
router.get('/', [authMiddleware, checkPermission('opportunities:view:own')], async (req, res) => {
    try {
        let queryText = `
            SELECT 
                o.*, 
                c.name as client_name, 
                s.name as stage_name, 
                u.nombre_completo as owner_name,
                (SELECT json_agg(t.*) FROM tags t JOIN opportunity_tags ot ON t.id = ot.tag_id WHERE ot.opportunity_id = o.id) as tags,
                (SELECT COUNT(*) FROM opportunity_members WHERE opportunity_id = o.id) as member_count,
                (SELECT json_build_object('total', COUNT(*), 'completed', COUNT(*) FILTER (WHERE is_completed = true)) FROM checklist_items WHERE opportunity_id = o.id) as checklist_progress
            FROM opportunities o
            LEFT JOIN clients c ON o.client_id = c.id
            LEFT JOIN pipeline_stages s ON o.stage_id = s.id
            LEFT JOIN users u ON o.owner_id = u.id
        `;
        const queryParams = [];

        if (req.user.rol === 'Team Member') {
            // Team members can see opportunities they own OR are assigned to.
            queryText += ` 
                WHERE o.owner_id = $1 OR o.id IN (SELECT opportunity_id FROM opportunity_members WHERE user_id = $1)
                GROUP BY o.id, c.name, s.name, u.nombre_completo, s.stage_order 
                ORDER BY s.stage_order ASC, o.created_at DESC
            `;
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

// GET /api/opportunities/:id - Get a single opportunity with all details
router.get('/:id', [authMiddleware, checkPermission('opportunities:view:own')], async (req, res) => {
    const { id } = req.params;

    try {
        const opportunityQuery = `
            SELECT o.*, c.name as client_name, s.name as stage_name, u.nombre_completo as owner_name
            FROM opportunities o
            LEFT JOIN clients c ON o.client_id = c.id
            LEFT JOIN pipeline_stages s ON o.stage_id = s.id
            LEFT JOIN users u ON o.owner_id = u.id
            WHERE o.id = $1
        `;
        const opportunityResult = await pool.query(opportunityQuery, [id]);

        if (opportunityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        const opportunity = opportunityResult.rows[0];

        // Check permissions for Team Members
        if (req.user.rol === 'Team Member' && opportunity.owner_id !== req.user.id) {
             // A team member might be assigned to an opportunity they don't own. Let's check that.
             const memberCheck = await pool.query('SELECT 1 FROM opportunity_members WHERE opportunity_id = $1 AND user_id = $2', [id, req.user.id]);
             if(memberCheck.rows.length === 0) {
                return res.status(403).json({ message: 'You do not have permission to view this opportunity' });
             }
        }


        const tagsQuery = `SELECT t.* FROM tags t JOIN opportunity_tags ot ON t.id = ot.tag_id WHERE ot.opportunity_id = $1`;
        const membersQuery = `SELECT u.id, u.nombre_completo, u.email FROM users u JOIN opportunity_members om ON u.id = om.user_id WHERE om.opportunity_id = $1`;
        const checklistQuery = `SELECT * FROM checklist_items WHERE opportunity_id = $1 ORDER BY created_at ASC`;
        const activitiesQuery = `SELECT a.*, u.nombre_completo as user_name FROM activities a JOIN users u ON a.user_id = u.id WHERE a.opportunity_id = $1 ORDER BY a.created_at DESC`;

        const [tagsResult, membersResult, checklistResult, activitiesResult] = await Promise.all([
            pool.query(tagsQuery, [id]),
            pool.query(membersQuery, [id]),
            pool.query(checklistQuery, [id]),
            pool.query(activitiesQuery, [id]),
        ]);

        const fullOpportunity = {
            ...opportunity,
            tags: tagsResult.rows,
            members: membersResult.rows,
            checklist: checklistResult.rows,
            activities: activitiesResult.rows,
        };

        res.json(fullOpportunity);

    } catch (err) {
        console.error(`Error fetching opportunity ${id}:`, err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /api/opportunities - Crea una nueva oportunidad
router.post('/', [authMiddleware, checkPermission('opportunities:create')], async (req, res) => {
    const { name, description, potential_amount, client_id, stage_id, close_date, teamMembers } = req.body;
    const owner_id = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const opportunityResult = await client.query(
            'INSERT INTO opportunities (name, description, potential_amount, client_id, stage_id, owner_id, close_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, description, potential_amount || null, client_id, stage_id, owner_id, close_date || null]
        );
        const newOpportunity = opportunityResult.rows[0];

        // Add team members to the opportunity
        if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
            const insertMemberPromises = teamMembers.map(userId => {
                return client.query(
                    'INSERT INTO opportunity_members (opportunity_id, user_id) VALUES ($1, $2)',
                    [newOpportunity.id, userId]
                );
            });
            await Promise.all(insertMemberPromises);
        }
        
        // Also add the owner as a member of the opportunity
        await client.query(
            'INSERT INTO opportunity_members (opportunity_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newOpportunity.id, owner_id]
        );


        await client.query('COMMIT');
        res.status(201).json(newOpportunity);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating opportunity:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        client.release();
    }
});

// PUT /api/opportunities/:id - Actualiza una oportunidad
router.put('/:id', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, potential_amount, client_id, stage_id, close_date } = req.body;

        const result = await pool.query(
            'UPDATE opportunities SET name = $1, description = $2, potential_amount = $3, client_id = $4, stage_id = $5, close_date = $6 WHERE id = $7 RETURNING *',
            [name, description, potential_amount, client_id, stage_id, close_date || null, id]
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

// DELETE /api/opportunities/:id - Elimina una oportunidad
router.delete('/:id', [authMiddleware, checkPermission('opportunities:delete')], async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM opportunities WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Oportunidad no encontrada.' });
        }

        res.status(200).json({ message: 'Oportunidad eliminada exitosamente.' });
    } catch (err) {
        console.error('Error deleting opportunity:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST /api/opportunities/:id/tags - Asignar una etiqueta a una oportunidad
router.post('/:id/tags', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { id } = req.params;
    const { tag_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO opportunity_tags (opportunity_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, tag_id]
        );
        res.status(201).send();
    } catch (err) {
        console.error('Error assigning tag:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE /api/opportunities/:id/tags/:tagId - Desasignar una etiqueta de una oportunidad
router.delete('/:id/tags/:tagId', [authMiddleware, checkPermission('opportunities:edit')], async (req, res) => {
    const { id, tagId } = req.params;
    try {
        await pool.query(
            'DELETE FROM opportunity_tags WHERE opportunity_id = $1 AND tag_id = $2',
            [id, tagId]
        );
        res.status(204).send();
    } catch (err) {
        console.error('Error unassigning tag:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;
