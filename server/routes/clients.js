import express from 'express';
import pool from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all client routes
router.use(authMiddleware);

// GET all clients
router.get('/', async (req, res) => {
    try {
        const allClients = await pool.query('SELECT * FROM clients ORDER BY name ASC');
        res.json(allClients.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single client
router.get('/:id', async (req, res) => {
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

// CREATE a new client
router.post('/', async (req, res) => {
    try {
        const { name, contact_info } = req.body;
        const newClient = await pool.query(
            'INSERT INTO clients (name, contact_info) VALUES ($1, $2) RETURNING *',
            [name, contact_info]
        );

        res.status(201).json(newClient.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// UPDATE a client
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error(err.message);
        // Handle foreign key constraints
        if (err.code === '23503') {
            return res.status(400).json({ message: 'Cannot delete client with active projects.' });
        }
        res.status(500).send('Server error');
    }
});

export default router;
