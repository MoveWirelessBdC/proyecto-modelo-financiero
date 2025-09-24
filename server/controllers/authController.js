import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js'; // Sequelize models

// Función para generar un token JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email usando Sequelize
        const user = await db.User.findOne({
            where: { email },
            include: [{
                model: db.Role,
                as: 'role',
                attributes: ['nombre_rol']
            }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = generateToken(user.id, user.role.nombre_rol);

        res.json({
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.role.nombre_rol,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};

// @desc    Obtener datos del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        // req.user se establece en authMiddleware
        const user = await db.User.findByPk(req.user.id, {
            attributes: ['id', 'nombre_completo', 'email'], // Excluir password_hash
            include: [{
                model: db.Role,
                as: 'role',
                attributes: ['nombre_rol']
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.role ? user.role.nombre_rol : null,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};