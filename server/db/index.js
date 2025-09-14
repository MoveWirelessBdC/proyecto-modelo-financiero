// server/db/index.js
import pg from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno del archivo .env que está en la carpeta 'server'
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Opcional: si usas SSL en producción, se configuraría aquí
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

export default pool;