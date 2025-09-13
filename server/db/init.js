// server/db/init.js
import pool from './index.js';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const ROLES = ['Asesor Financiero', 'Equipo Comercial', 'Contable'];
const PERMISSIONS = [ /* ... (lista de permisos sin cambios) ... */ ];
const ROLE_PERMISSIONS = { /* ... (asignación de permisos sin cambios) ... */ };

const initializeDatabase = async () => {
    console.log('🚀 Iniciando la inicialización de la base de datos...');
    try {
        await db.sequelize.sync({ force: true });
        console.log('🏗️  Tablas de la base de datos creadas/sincronizadas.');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log('🔄 Insertando roles...');
            const roleInsertPromises = ROLES.map(role => client.query('INSERT INTO "Roles" (nombre_rol) VALUES ($1) ON CONFLICT (nombre_rol) DO NOTHING', [role]));
            await Promise.all(roleInsertPromises);
            console.log('✅ Roles insertados correctamente.');

            console.log('🔄 Insertando permisos...');
            const permissionInsertPromises = PERMISSIONS.map(permission => client.query('INSERT INTO "Permissions" (accion) VALUES ($1) ON CONFLICT (accion) DO NOTHING', [permission]));
            await Promise.all(permissionInsertPromises);
            console.log('✅ Permisos insertados correctamente.');

            console.log('🔄 Asignando permisos a roles...');
            for (const roleName in ROLE_PERMISSIONS) {
                const roleResult = await client.query('SELECT id FROM "Roles" WHERE nombre_rol = $1', [roleName]);
                const roleId = roleResult.rows[0].id;
                const permissionsForRole = ROLE_PERMISSIONS[roleName];
                for (const permissionAction of permissionsForRole) {
                    const permissionResult = await client.query('SELECT id FROM "Permissions" WHERE accion = $1', [permissionAction]);
                    const permissionId = permissionResult.rows[0].id;
                    await client.query('INSERT INTO "Rol_Permisos" (rol_id, permiso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [roleId, permissionId]);
                }
            }
            console.log('✅ Permisos asignados correctamente.');

            console.log('🔄 Creando usuario administrador...');
            const adminEmail = 'admin@app.com';
            const adminPassword = 'supersecretpassword';
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);
            const adminRoleResult = await client.query("SELECT id FROM \"Roles\" WHERE nombre_rol = 'Asesor Financiero'");
            const adminRoleId = adminRoleResult.rows[0].id;
            await client.query(
                `INSERT INTO "Users" (nombre_completo, email, password_hash, rol_id, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (email) DO NOTHING`,
                ['Administrador del Sistema', adminEmail, passwordHash, adminRoleId]
            );
            console.log(`✅ Usuario administrador creado con email: ${adminEmail} y contraseña: ${adminPassword}`);

            await client.query('COMMIT');
            console.log('🎉 ¡Inicialización de la base de datos completada exitosamente!');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
    }
};

initializeDatabase().then(() => {
    pool.end();
});