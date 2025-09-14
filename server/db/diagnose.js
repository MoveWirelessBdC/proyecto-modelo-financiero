// server/db/diagnose.js
import pool from './index.js';

const runDiagnostics = async () => {
    console.log('--- 🔬 Iniciando diagnóstico de permisos ---');
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT
                r.nombre_rol,
                p.accion AS permiso
            FROM rol_permisos rp
            JOIN roles r ON rp.rol_id = r.id
            JOIN permissions p ON rp.permiso_id = p.id
            ORDER BY r.nombre_rol, p.accion;
        `);

        if (result.rows.length === 0) {
            console.log('\n--- ❌ RESULTADO DEL DIAGNÓSTICO ---');
            console.log('La tabla "rol_permisos" está VACÍA. No se ha asignado ningún permiso a ningún rol.');
            console.log('Este es el origen del error 403 Forbidden.');
            return;
        }

        console.log('\n--- ✅ RESULTADO DEL DIAGNÓSTICO: Permisos Asignados ---');
        let currentRole = '';
        result.rows.forEach(row => {
            if (row.nombre_rol !== currentRole) {
                currentRole = row.nombre_rol;
                console.log(`\n--- ROL: ${currentRole} ---`);
            }
            console.log(` -> ${row.permiso}`);
        });

    } catch (error) {
        console.error('\n--- ❌ ERROR AL EJECUTAR EL DIAGNÓSTICO ---');
        console.error(error);
    } finally {
        client.release();
        pool.end();
    }
};

runDiagnostics();