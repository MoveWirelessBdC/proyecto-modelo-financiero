import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET all clients (con lógica de propiedad)
router.get('/', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        let query;
        const queryParams = [];
        
        // Consulta base que une clientes con usuarios para obtener el nombre del propietario
        const baseQuery = `
            SELECT c.*, u.nombre_completo as owner_name 
            FROM clients c
            LEFT JOIN users u ON c.owner_id = u.id
        `;

        // Si el rol es 'Equipo Comercial', filtramos por su ID
        if (req.user.rol === 'Equipo Comercial') {
            query = `${baseQuery} WHERE c.owner_id = $1 ORDER BY c.name ASC`;
            queryParams.push(req.user.id);
        } else {
            // Si es Admin o Contable, ve todos los clientes
            query = `${baseQuery} ORDER BY c.name ASC`;
        }
        
        const allClients = await pool.query(query, queryParams);
        res.json(allClients.rows);
    } catch (err) {
        console.error("Error fetching clients:", err.message);
        res.status(500).send('Server error');
    }
});

// CREATE a new client (asignando propietario)
router.post('/', [authMiddleware, checkPermission('clients:create')], async (req, res) => {
    try {
        const { name, contact_info } = req.body;
        const ownerId = req.user.id; // Obtenemos el ID del usuario logueado
        
        const newClient = await pool.query(
            'INSERT INTO clients (name, contact_info, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [name, contact_info, ownerId]
        );

        res.status(201).json(newClient.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single client
router.get('/:id', [authMiddleware, checkPermission('clients:view')], async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (client.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// UPDATE a client
router.put('/:id', [authMiddleware, checkPermission('clients:edit')], async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_info } = req.body;
        const updatedClient = await pool.query(
            'UPDATE clients SET name = $1, contact_info = $2 WHERE id = $3 RETURNING *',
            [name, contact_info, id]
        );
        if (updatedClient.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(updatedClient.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a client
router.delete('/:id', [authMiddleware, checkPermission('clients:delete')], async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') {
            return res.status(400).json({ message: 'Cannot delete client with active projects.' });
        }
        res.status(500).send('Server error');
    }
});


export default router;
