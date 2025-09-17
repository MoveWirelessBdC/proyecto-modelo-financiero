// server/routes/users.js
import express from 'express';
import pool from '../db/index.js';
import bcrypt from 'bcryptjs';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Obtiene todos los usuarios o busca por término
router.get('/', authMiddleware, async (req, res) => {
    const { search } = req.query;

    try {
        if (search) {
            const query = `
                SELECT id, nombre_completo as name, email FROM users
                WHERE (nombre_completo ILIKE $1 OR email ILIKE $1)
                ORDER BY nombre_completo
                LIMIT 10
            `;
            const { rows } = await pool.query(query, [`%${search}%`]);
            // The frontend expects 'name', so we alias 'nombre_completo'
            return res.json(rows);
        }

        // Si no es búsqueda, es para la lista completa, aplicamos permisos más estrictos
        checkPermission('users:view')(req, res, async () => {
            const { rows } = await pool.query('SELECT u.id, u.nombre_completo, u.email, r.nombre_rol FROM users u JOIN roles r ON u.rol_id = r.id ORDER BY u.id');
            res.json(rows.map(u => ({...u, name: u.nombre_completo}))); // Mapear a 'name' para consistencia
        });

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
});

// POST /api/users - Crea un nuevo usuario
router.post('/', [authMiddleware, checkPermission('users:create')], async (req, res) => {
    const { nombre_completo, email, password, rol_id } = req.body;
    if (!nombre_completo || !email || !password || !rol_id) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (nombre_completo, email, password_hash, rol_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo, email',
            [nombre_completo, email, passwordHash, rol_id]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Error de email duplicado
            return res.status(400).json({ message: 'El email ya está en uso.' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
