// server/controllers/authController.js
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query(
            `SELECT u.id, u.nombre_completo, u.email, u.password_hash, r.nombre_rol 
             FROM users u 
             JOIN roles r ON u.rol_id = r.id 
             WHERE u.email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }
        const user = userResult.rows[0];

        const passwordIsValid = bcryptjs.compareSync(password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).send({ message: 'Contraseña inválida.' });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.nombre_rol },
            process.env.JWT_SECRET,
            { expiresIn: 86400 } // 24 horas
        );

        const userResponse = {
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.nombre_rol,
        };

        res.status(200).send({
            user: userResponse,
            accessToken: token
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).send({ message: "Error interno del servidor en el login." });
    }
};

export const getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT u.id, u.nombre_completo, u.email, r.nombre_rol 
             FROM users u 
             JOIN roles r ON u.rol_id = r.id 
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        const user = userResult.rows[0];

        res.status(200).send({
            user: {
                id: user.id,
                nombre_completo: user.nombre_completo,
                email: user.email,
                rol: user.nombre_rol,
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send({ message: "Error interno del servidor." });
    }
};