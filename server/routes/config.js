import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET /api/config - Get the current configuration
router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT value FROM global_config WHERE key = 'master_config'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({}); // Return empty object if no config is set
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/config - Update the configuration
router.post('/', async (req, res) => {
    const configValue = req.body;
    try {
        // Use an UPSERT operation to either insert a new config or update the existing one
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
