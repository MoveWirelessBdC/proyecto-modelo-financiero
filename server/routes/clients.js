// server/routes/clients.js
import express from 'express';
import db from '../models/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/clients - Obtiene clientes según el rol
router.get('/', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        const options = {
            include: [{
                model: db.User,
                as: 'owner',
                attributes: ['nombre_completo']
            }],
            order: [['name', 'ASC']]
        };

        if (req.user.rol === 'Team Member') {
            options.where = { owner_id: req.user.id };
        }

        const clients = await db.Client.findAll(options);
        
        // Flatten the response to match the old structure
        const flattenedClients = clients.map(c => ({
            ...c.toJSON(),
            owner_name: c.owner ? c.owner.nombre_completo : null
        }));

        res.json(flattenedClients);
    } catch (err) {
        console.error("Error fetching clients:", err);
        res.status(500).send('Server error');
    }
});

// POST /api/clients - Crea un cliente asignando al propietario actual
router.post('/', [authMiddleware, checkPermission('clients:create')], async (req, res) => {
    try {
        const { name, contact_info } = req.body;
        const owner_id = req.user.id;

        const newClient = await db.Client.create({
            name,
            contact_info,
            owner_id
        });

        res.status(201).json(newClient);
    } catch (err) {
        console.error("Error creating client:", err);
        res.status(500).send('Server error');
    }
});

// GET /api/clients/stats - Obtiene estadísticas de clientes
router.get('/stats', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        const baseWhere = req.user.rol === 'Team Member' ? { owner_id: req.user.id } : {};
        
        // Total de clientes
        const totalClients = await db.Client.count({ where: baseWhere });
        
        // Proyectos activos por cliente
        const clientProjectsQuery = `
            SELECT COUNT(DISTINCT p.id) as active_projects, 
                   COALESCE(SUM(p.amount), 0) as total_value
            FROM clients c
            LEFT JOIN projects p ON c.id = p.client_id AND p.status = 'Activo'
            ${req.user.rol === 'Team Member' ? 'WHERE c.owner_id = $1' : ''}
        `;
        
        const params = req.user.rol === 'Team Member' ? [req.user.id] : [];
        const result = await db.sequelize.query(clientProjectsQuery, {
            replacements: params,
            type: db.sequelize.QueryTypes.SELECT
        });
        
        const stats = result[0] || { active_projects: 0, total_value: 0 };
        
        res.json({
            total: totalClients,
            activeProjects: parseInt(stats.active_projects || 0),
            totalValue: parseFloat(stats.total_value || 0)
        });
    } catch (err) {
        console.error("Error fetching client stats:", err);
        res.status(500).send('Server error');
    }
});

// GET /api/clients/:id/details - Obtiene detalles completos de un cliente
router.get('/:id/details', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        const clientId = parseInt(req.params.id, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ message: 'ID de cliente inválido.' });
        }

        const baseWhere = req.user.rol === 'Team Member' ? { id: clientId, owner_id: req.user.id } : { id: clientId };
        
        const client = await db.Client.findOne({
            where: baseWhere,
            include: [{
                model: db.User,
                as: 'owner',
                attributes: ['nombre_completo']
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        // Obtener proyectos del cliente
        const projects = await db.Project.findAll({
            where: { client_id: clientId },
            order: [['start_date', 'DESC']]
        });

        // Obtener oportunidades del cliente usando query SQL
        const opportunitiesQuery = `
            SELECT o.*, s.name as stage_name, u.nombre_completo as owner_name
            FROM opportunities o
            LEFT JOIN pipeline_stages s ON o.stage_id = s.id
            LEFT JOIN users u ON o.owner_id = u.id
            WHERE o.client_id = ?
            ORDER BY o.created_at DESC
        `;
        
        const opportunities = await db.sequelize.query(opportunitiesQuery, {
            replacements: [clientId],
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json({
            client: {
                ...client.toJSON(),
                owner_name: client.owner ? client.owner.nombre_completo : null
            },
            projects,
            opportunities
        });
    } catch (err) {
        console.error(`Error fetching client details for id ${req.params.id}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;