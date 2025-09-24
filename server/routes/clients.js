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

export default router;