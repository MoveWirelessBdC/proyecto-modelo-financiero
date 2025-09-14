
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
        
        // --- LA CORRECCIÓN ---
        // El token que generamos al hacer login contiene 'id', no 'userId'.
        // Este es el error que causa los fallos de permisos.
        req.user = { id: decoded.id }; 
        
        next();

    } catch (error) {
        console.error('[AUTH ERROR] El token es inválido o ha expirado.', error.message);
        return res.status(401).send({ message: 'No autorizado: Token inválido.' });
    }
};

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).send({ message: "No autorizado: ID de usuario no encontrado en la sesión." });
            }

            const permissionsQuery = await pool.query(
                `SELECT p.accion 
                 FROM permissions p
                 JOIN rol_permisos rp ON p.id = rp.permiso_id
                 WHERE rp.rol_id = (SELECT rol_id FROM users WHERE id = $1)`,
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
