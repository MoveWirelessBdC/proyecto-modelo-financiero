// server/routes/roles.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/roles - Obtiene todos los roles
router.get('/', [authMiddleware, checkPermission('roles:view')], async (req, res) => {
    try {
        const roles = await pool.query('SELECT * FROM roles');
        res.json(roles.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
