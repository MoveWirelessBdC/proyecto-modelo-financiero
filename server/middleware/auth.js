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
        req.user = { id: decoded.id, rol: decoded.rol }; // Guardamos id y rol
        next();
    } catch (error) {
        return res.status(401).send({ message: 'No autorizado: Token inválido.' });
    }
};

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        // Si el rol es Owner, tiene todos los permisos.
        if (req.user.rol === 'Owner') {
            return next();
        }

        try {
            // Consulta optimizada: usa el rol del token para buscar permisos.
            const permissionsQuery = await pool.query(
                `SELECT p.accion 
                 FROM permissions p 
                 JOIN rol_permisos rp ON p.id = rp.permiso_id 
                 JOIN roles r ON rp.rol_id = r.id
                 WHERE r.nombre_rol = $1`,
                [req.user.rol]
            );
            
            const userPermissions = permissionsQuery.rows.map(row => row.accion);
            
            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).send({ message: `Acción denegada. Permiso requerido: ${requiredPermission}` });
            }
        } catch (error) {
             console.error("Error checking permissions:", error);
             res.status(500).send({ message: "Error al verificar permisos." });
        }
    };
};