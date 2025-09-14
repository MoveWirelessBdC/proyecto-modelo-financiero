import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User, Role, Permission } = db;

const authController = {
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({
                where: { email },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        include: [{
                            model: Permission,
                            as: 'permissions',
                            through: { attributes: [] }
                        }]
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            const permissions = user.role && user.role.permissions ? user.role.permissions.map(p => p.accion) : [];

            const accessToken = jwt.sign(
                {
                    id: user.id,
                    nombre: user.nombre_completo,
                    rol: user.role ? user.role.nombre_rol : null,
                    permissions: permissions
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ 
                message: "Login exitoso",
                accessToken,
                user: {
                    id: user.id,
                    nombre: user.nombre_completo,
                    email: user.email,
                    rol: user.role ? user.role.nombre_rol : 'Sin rol',
                    permissions
                }
            });

        } catch (error) {
            console.error("Error en el login:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
};

export default authController;