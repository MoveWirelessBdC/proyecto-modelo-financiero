// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

export const authMiddleware = async (req, res, next) => {
    // ... (los console.log de diagnóstico no cambian)
    try {
        let token = req.headers['authorization'];
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Acceso denegado: No se proveyó un token válido.' });
        }
        token = token.slice(7, token.length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId }; // Corregimos aquí también, el token tiene userId
        next();
    } catch (error) {
        console.error('[AUTH ERROR] El token es inválido o ha expirado.', error.message);
        return res.status(401).send({ message: 'No autorizado: Token inválido.' });
    }
};

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // LA CORRECCIÓN ESTÁ EN ESTA CONSULTA
            const permissionsQuery = await pool.query(
                `SELECT p.accion 
                 FROM "Permissions" p
                 JOIN "Rol_Permisos" rp ON p.id = rp.permiso_id
                 WHERE rp.rol_id = (SELECT rol_id FROM "Users" WHERE id = $1)`,
                [req.user.id]
            );
            const userPermissions = permissionsQuery.rows.map(row => row.accion);

            if (userPermissions && userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).send({ message: `Acción denegada. Se requiere el permiso: ${requiredPermission}` });
            }
        } catch (error) {
             console.error('[PERM ERROR] Error al verificar permisos:', error);
             res.status(500).send({ message: "Error al verificar permisos." });
        }
    };
};