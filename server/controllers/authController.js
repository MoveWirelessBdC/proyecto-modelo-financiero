// server/controllers/authController.js
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const User = db.User;
const Role = db.Role;
const Permission = db.Permission;

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            include: {
                model: Role,
                include: [Permission]
            }
        });

        if (!user) {
            return res.status(404).send({ message: 'Error: Usuario no encontrado.' });
        }

        const passwordIsValid = bcryptjs.compareSync(password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).send({ message: '¡Contraseña inválida!' });
        }

        const permissions = user.Role.Permissions.map(p => p.accion);

        const token = jwt.sign(
            // El userId ahora se llama 'id' en el token para mayor claridad
            { id: user.id, rol: user.Role.nombre_rol, permissions },
            process.env.JWT_SECRET,
            { expiresIn: 86400 } // Expira en 24 horas
        );

        res.status(200).send({
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.Role.nombre_rol,
            accessToken: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};