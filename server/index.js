// --- LA CAJA NEGRA v2: CAPTURADOR DE ERRORES TOTAL ---
// Capturador para errores síncronos estándar
process.on('uncaughtException', (err, origin) => {
  console.error('--- ERROR FATAL NO CAPTURADO (UNCAUGHT EXCEPTION) ---');
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error(`Origin: ${origin}`);
  process.exit(1);
});

// NUEVO: Capturador para errores en promesas que no fueron manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('--- ERROR FATAL NO CAPTURADO (UNHANDLED REJECTION) ---');
  console.error('Razón del rechazo:', reason);
  // Opcional: Descomenta la siguiente línea para ver el objeto de la promesa
  // console.error('Promesa:', promise);
  process.exit(1);
});

// El resto de tu código de servidor
import express from 'express';
import cors from 'cors';
import pool from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
import portfolioRoutes from './routes/portfolio.js';
import configRoutes from './routes/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/config', configRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});