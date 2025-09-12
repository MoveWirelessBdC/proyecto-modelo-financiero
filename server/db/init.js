import pool from './index.js';
import bcrypt from 'bcrypt';

const createTablesAndAdmin = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Users table for authentication
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if admin user exists
        const res = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
        if (res.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password', salt);
            await client.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', ['admin', passwordHash]);
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists.');
        }

        // Global config table
        await client.query(`
            CREATE TABLE IF NOT EXISTS global_config (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) UNIQUE NOT NULL,
                value JSONB NOT NULL
            );
        `);

        // Clients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_info TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Projects table
        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
                description TEXT NOT NULL,
                amount NUMERIC(15, 2) NOT NULL,
                start_date DATE NOT NULL,
                interest_rate NUMERIC(5, 2) NOT NULL,
                insurance_cost NUMERIC(5, 2) NOT NULL,
                term_months INTEGER NOT NULL,
                sales_commission NUMERIC(5, 2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Amortization schedule table
        await client.query(`
            CREATE TABLE IF NOT EXISTS amortization_schedule (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                month INTEGER NOT NULL,
                payment_date DATE NOT NULL,
                monthly_payment NUMERIC(15, 2) NOT NULL,
                principal NUMERIC(15, 2) NOT NULL,
                interest NUMERIC(15, 2) NOT NULL,
                remaining_balance NUMERIC(15, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending'
            );
        `);

        // Portfolio assets table
        await client.query(`
            CREATE TABLE IF NOT EXISTS portfolio_assets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                purchase_value NUMERIC(15, 2) NOT NULL,
                purchase_date DATE NOT NULL,
                current_market_value NUMERIC(15, 2),
                last_updated DATE
            );
        `);

        // Portfolio transactions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS portfolio_transactions (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL, -- e.g., 'Initial Capital', 'Reinvestment', 'Liquidation'
                amount NUMERIC(15, 2) NOT NULL,
                transaction_date DATE NOT NULL,
                description TEXT
            );
        `);

        console.log('All tables created successfully!');
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error creating tables', e.stack);
    } finally {
        client.release();
    }
};

createTablesAndAdmin().then(() => pool.end());