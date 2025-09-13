import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );

        const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error(error.message);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Username already exists.' });
        }
        res.status(500).send('Server error');
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
