import dotenv from 'dotenv';
dotenv.config(); // Carga el .env desde el directorio actual (server/)

import pool from './index.js';
import bcrypt from 'bcryptjs';

const CREATE_TABLES_SQL = `
    DROP TABLE IF EXISTS activities CASCADE;
    DROP TABLE IF EXISTS opportunity_tags CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
    DROP TABLE IF EXISTS opportunities CASCADE;
    DROP TABLE IF EXISTS leads CASCADE;
    DROP TABLE IF EXISTS pipeline_stages CASCADE;
    DROP TABLE IF EXISTS amortization_schedule CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS clients CASCADE;
    DROP TABLE IF EXISTS portfolio_assets CASCADE;
    DROP TABLE IF EXISTS global_config CASCADE;
    DROP TABLE IF EXISTS rol_permisos CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
    DROP TABLE IF EXISTS permissions CASCADE;

    CREATE TABLE roles ( id SERIAL PRIMARY KEY, nombre_rol VARCHAR(50) UNIQUE NOT NULL );
    CREATE TABLE permissions ( id SERIAL PRIMARY KEY, accion VARCHAR(100) UNIQUE NOT NULL );
    CREATE TABLE rol_permisos ( rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE, permiso_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY (rol_id, permiso_id) );
    CREATE TABLE users ( id SERIAL PRIMARY KEY, nombre_completo VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, rol_id INTEGER REFERENCES roles(id) );
    CREATE TABLE clients ( id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, contact_info TEXT, owner_id INTEGER REFERENCES users(id) );
    CREATE TABLE projects ( id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, description TEXT, amount NUMERIC(12, 2) NOT NULL, start_date DATE NOT NULL, interest_rate NUMERIC(10, 4) NOT NULL, insurance_cost NUMERIC(10, 4) NOT NULL, term_months INTEGER NOT NULL, sales_commission NUMERIC(10, 4), created_by_id INTEGER REFERENCES users(id) );
    CREATE TABLE amortization_schedule ( id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE, month_number INTEGER NOT NULL, payment_date DATE NOT NULL, monthly_payment NUMERIC(12, 2) NOT NULL, principal NUMERIC(12, 2) NOT NULL, interest NUMERIC(12, 2) NOT NULL, remaining_balance NUMERIC(12, 2) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pending', UNIQUE(project_id, month_number) );
    CREATE TABLE portfolio_assets ( id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, ticker_symbol VARCHAR(20), purchase_value NUMERIC(15, 2) NOT NULL, current_market_value NUMERIC(15, 2), purchase_date DATE, last_updated DATE );
    CREATE TABLE global_config ( key VARCHAR(50) PRIMARY KEY, value JSONB );
    CREATE TABLE pipeline_stages ( id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, stage_order INTEGER NOT NULL UNIQUE, is_archived BOOLEAN DEFAULT false );
    CREATE TABLE leads ( id SERIAL PRIMARY KEY, source VARCHAR(100), contact_details TEXT NOT NULL, status VARCHAR(50) DEFAULT 'New', owner_id INTEGER REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );
    CREATE TABLE opportunities ( id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, potential_amount NUMERIC(12, 2), client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, stage_id INTEGER REFERENCES pipeline_stages(id), owner_id INTEGER REFERENCES users(id), close_date DATE, lost_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );
    CREATE TABLE activities ( id SERIAL PRIMARY KEY, type VARCHAR(50) NOT NULL, description TEXT NOT NULL, due_date TIMESTAMPTZ, status VARCHAR(50) DEFAULT 'Pending', user_id INTEGER REFERENCES users(id), client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );
    CREATE TABLE tags ( id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, color VARCHAR(7) NOT NULL, user_id INTEGER REFERENCES users(id) );
    CREATE TABLE opportunity_tags ( opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE, tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (opportunity_id, tag_id) );
`;

const ROLES = ['Owner', 'Admin', 'Manager', 'Team Member', 'Observer'];
const PERMISSIONS = [ 'projects:view', 'projects:create', 'projects:delete', 'payments:edit', 'clients:view', 'clients:create', 'clients:edit', 'clients:delete', 'portfolio:view', 'portfolio:edit', 'portfolio:delete', 'config:view', 'config:edit', 'users:view', 'users:create', 'users:delete', 'roles:view', 'roles:edit', 'permissions:manage', 'leads:view', 'leads:create', 'leads:edit', 'leads:delete', 'opportunities:view:all', 'opportunities:view:team', 'opportunities:view:own', 'opportunities:create', 'opportunities:edit', 'opportunities:delete', 'activities:view', 'activities:create', 'activities:edit', 'activities:delete', 'stages:edit', 'tags:manage' ];
const ROLE_PERMISSIONS = {
    'Owner': [...PERMISSIONS], 'Admin': [...PERMISSIONS],
    'Manager': [ 'projects:view', 'projects:create', 'clients:view', 'clients:create', 'clients:edit', 'leads:view', 'leads:create', 'leads:edit', 'opportunities:view:team', 'opportunities:create', 'opportunities:edit', 'activities:view', 'activities:create', 'activities:edit' ],
    'Team Member': [ 'projects:view', 'projects:create', 'clients:view', 'clients:create', 'clients:edit', 'leads:view', 'leads:create', 'leads:edit', 'opportunities:view:own', 'opportunities:create', 'opportunities:edit', 'activities:view', 'activities:create', 'activities:edit' ],
    'Observer': [ 'projects:view', 'clients:view', 'portfolio:view', 'config:view', 'users:view', 'roles:view', 'leads:view', 'opportunities:view:all', 'activities:view' ]
};

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(CREATE_TABLES_SQL);
        await client.query(` INSERT INTO pipeline_stages (name, stage_order) VALUES ('Prospección', 1), ('Calificación', 2), ('Propuesta Enviada', 3), ('Negociación', 4), ('Cerrado-Ganado', 5), ('Cerrado-Perdido', 6) ON CONFLICT DO NOTHING; `);
        const roleIds = {}, permissionIds = {};
        for (const role of ROLES) { const res = await client.query('INSERT INTO roles (nombre_rol) VALUES ($1) ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol=EXCLUDED.nombre_rol RETURNING id', [role]); roleIds[role] = res.rows[0].id; }
        for (const perm of PERMISSIONS) { const res = await client.query('INSERT INTO permissions (accion) VALUES ($1) ON CONFLICT (accion) DO UPDATE SET accion=EXCLUDED.accion RETURNING id', [perm]); permissionIds[perm] = res.rows[0].id; }
        for (const roleName in ROLE_PERMISSIONS) { const roleId = roleIds[roleName]; const permsToAssign = ROLE_PERMISSIONS[roleName]; for (const permName of permsToAssign) { if (!permissionIds[permName]) continue; const permId = permissionIds[permName]; await client.query('INSERT INTO rol_permisos (rol_id, permiso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [roleId, permId]); } }
        const hashedPassword = await bcrypt.hash('supersecretpassword', 10);
        await client.query( 'INSERT INTO users (nombre_completo, email, password_hash, rol_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING', ['Admin User', 'admin@app.com', hashedPassword, roleIds['Owner']] );
        console.log('✅ Base de datos inicializada con éxito. Usuario: admin@app.com, Contraseña: supersecretpassword');
    } catch (error) { console.error('❌ Error durante la inicialización:', error);
    } finally { client.release(); }
};

initializeDatabase().then(() => pool.end());
