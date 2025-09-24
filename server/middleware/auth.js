// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

export const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Acceso denegado: No se proveyó un token válido.' });
        }
        token = token.slice(7, token.length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, rol: decoded.rol }; // Guardamos id Y rol
        next();
    } catch (error) {
        return res.status(401).send({ message: 'No autorizado: Token inválido.' });
    }
};

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const permissionsQuery = await pool.query(
                `SELECT p.accion FROM permissions p JOIN rol_permisos rp ON p.id = rp.permiso_id WHERE rp.rol_id = (SELECT rol_id FROM users WHERE id = $1)`,
                [req.user.id]
            );
            const userPermissions = permissionsQuery.rows.map(row => row.accion);
            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).send({ message: `Acción denegada. Permiso requerido: ${requiredPermission}` });
            }
        } catch (error) {
             res.status(500).send({ message: "Error al verificar permisos." });
        }
    };
};