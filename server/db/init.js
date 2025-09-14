// server/db/init.js
import pool from './index.js';
import bcrypt from 'bcryptjs';

const CREATE_TABLES_SQL = `
    DROP TABLE IF EXISTS amortization_schedule CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS clients CASCADE;
    DROP TABLE IF EXISTS portfolio_assets CASCADE;
    DROP TABLE IF EXISTS global_config CASCADE;
    DROP TABLE IF EXISTS rol_permisos CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
    DROP TABLE IF EXISTS permissions CASCADE;
    
    CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        nombre_rol VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE permissions (
        id SERIAL PRIMARY KEY,
        accion VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE rol_permisos (
        rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        permiso_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (rol_id, permiso_id)
    );

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol_id INTEGER REFERENCES roles(id)
    );

    CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_info TEXT
    );

    CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        description TEXT,
        amount NUMERIC(12, 2) NOT NULL,
        start_date DATE NOT NULL,
        interest_rate NUMERIC(10, 4) NOT NULL,
        insurance_cost NUMERIC(10, 4) NOT NULL,
        sales_commission NUMERIC(10, 4),
        term_months INTEGER NOT NULL,
        created_by_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE amortization_schedule (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        month_number INTEGER NOT NULL,
        payment_date DATE NOT NULL,
        monthly_payment NUMERIC(12, 2) NOT NULL,
        principal NUMERIC(12, 2) NOT NULL,
        interest NUMERIC(12, 2) NOT NULL,
        remaining_balance NUMERIC(12, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Puede ser 'Pending', 'Paid', 'Late'
        UNIQUE(project_id, month_number)
    );
    
    CREATE TABLE portfolio_assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ticker_symbol VARCHAR(20),
        purchase_value NUMERIC(15, 2) NOT NULL,
        current_market_value NUMERIC(15, 2),
        purchase_date DATE,
        last_updated DATE
    );

    CREATE TABLE global_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT
    );
`;

const ROLES = ['Asesor Financiero', 'Equipo Comercial', 'Contable'];
const PERMISSIONS = [
    'projects:view', 'projects:create', 'projects:delete', 'payments:edit',
    'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
    'portfolio:view', 'portfolio:edit', 'portfolio:delete',
    'config:view', 'config:edit', 'users:create', 'users:delete',
    'roles:view', 'roles:edit', 'permissions:manage'
];

const ROLE_PERMISSIONS = {
    'Asesor Financiero': [...PERMISSIONS],
    'Equipo Comercial': ['projects:view', 'projects:create', 'clients:view', 'clients:create', 'clients:edit'],
    'Contable': ['projects:view', 'payments:edit', 'clients:view', 'portfolio:view']
};

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('--- Empezando inicialización de la base de datos ---');
        
        console.log('1. Creando tablas...');
        await client.query(CREATE_TABLES_SQL);
        console.log('Tablas creadas con éxito.');

        console.log('2. Insertando roles y permisos...');
        const roleIds = {};
        for (const role of ROLES) {
            const res = await client.query('INSERT INTO roles (nombre_rol) VALUES ($1) RETURNING id', [role]);
            roleIds[role] = res.rows[0].id;
        }

        const permissionIds = {};
        for (const perm of PERMISSIONS) {
            const res = await client.query('INSERT INTO permissions (accion) VALUES ($1) RETURNING id', [perm]);
            permissionIds[perm] = res.rows[0].id;
        }
        console.log('Roles y permisos insertados.');

        console.log('3. Asignando permisos a roles...');
        for (const roleName in ROLE_PERMISSIONS) {
            const roleId = roleIds[roleName];
            const permsToAssign = ROLE_PERMISSIONS[roleName];
            for (const permName of permsToAssign) {
                const permId = permissionIds[permName];
                await client.query('INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2)', [roleId, permId]);
            }
        }
        console.log('Permisos asignados.');

        console.log('4. Creando usuario de prueba...');
        const hashedPassword = await bcrypt.hash('supersecretpassword', 10);
        const adminRoleId = roleIds['Asesor Financiero'];
        await client.query(
            'INSERT INTO users (nombre_completo, email, password_hash, rol_id) VALUES ($1, $2, $3, $4)',
            ['Admin User', 'admin@app.com', hashedPassword, adminRoleId]
        );
        console.log('Usuario de prueba creado (admin@app.com / supersecretpassword).');

        console.log('5. Insertando clientes de ejemplo...');
        await client.query(`
            INSERT INTO clients (name, contact_info) VALUES
            ('Tech Solutions Inc.', 'contact@techsolutions.com'),
            ('Innovatech', 'info@innovatech.io'),
            ('Constructora XYZ', 'proyectos@constructoraxyz.com');
        `);
        console.log('Clientes de ejemplo insertados.');

        console.log('--- Inicialización de la base de datos completada ---');
    } catch (error) {
        console.error('Error durante la inicialización de la base de datos:', error);
    } finally {
        client.release();
    }
};

initializeDatabase().then(() => {
    console.log('Script de inicialización finalizado.');
    pool.end();
});