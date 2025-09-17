// server/routes/clients.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/clients - Obtiene clientes según el rol
router.get('/', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        let query;
        const queryParams = [];
        const baseQuery = `SELECT c.*, u.nombre_completo as owner_name FROM clients c LEFT JOIN users u ON c.owner_id = u.id`;

        if (req.user.rol === 'Team Member') {
            query = `${baseQuery} WHERE c.owner_id = $1 ORDER BY c.name ASC`;
            queryParams.push(req.user.id);
        } else {
            query = `${baseQuery} ORDER BY c.name ASC`;
        }
        
        const allClients = await pool.query(query, queryParams);
        res.json(allClients.rows);
    } catch (err) {
        console.error("Error fetching clients:", err);
        res.status(500).send('Server error');
    }
});

// POST /api/clients - Crea un cliente asignando al propietario actual
router.post('/', [authMiddleware, checkPermission('clients:create')], async (req, res) => {
    try {
        const { name, contact_info } = req.body;
        const ownerId = req.user.id;
        
        const newClient = await pool.query(
            'INSERT INTO clients (name, contact_info, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [name, contact_info, ownerId]
        );
        res.status(201).json(newClient.rows[0]);
    } catch (err) {
        console.error("Error creating client:", err);
        res.status(500).send('Server error');
    }
});

// Otras rutas (DELETE, UPDATE, etc.) también deben ser aseguradas
// GET /api/clients/:id
router.get('/:id', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    // ... tu lógica para obtener un solo cliente
});

export default router;
