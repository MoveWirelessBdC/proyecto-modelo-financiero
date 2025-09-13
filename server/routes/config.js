import express from 'express';
import pool from '../db/index.js';
// CAMBIO: Importamos las herramientas de seguridad
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/config - Obtener la configuración actual
router.get('/', [authMiddleware, checkPermission('config:view')], async (req, res) => {
    try {
        const result = await pool.query("SELECT value FROM global_config WHERE key = 'master_config'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/config - Actualizar la configuración
router.post('/', [authMiddleware, checkPermission('config:edit')], async (req, res) => {
    const configValue = req.body;
    try {
        const query = `
            INSERT INTO global_config (key, value)
            VALUES ('master_config', $1)
            ON CONFLICT (key)
            DO UPDATE SET value = $1;
        `;
        await pool.query(query, [JSON.stringify(configValue)]);
        res.json({ message: 'Configuration saved successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;