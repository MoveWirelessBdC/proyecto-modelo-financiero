// --- LA CAJA NEGRA v2: CAPTURADOR DE ERRORES TOTAL ---
process.on('uncaughtException', (err, origin) => { /* ... */ });
process.on('unhandledRejection', (reason, promise) => { /* ... */ });

// --- IMPORTACIONES PRINCIPALES ---
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- IMPORTACIONES DE RUTAS ---
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
import portfolioRoutes from './routes/portfolio.js';
import dashboardRoutes from './routes/dashboard.js'; // <-- NUEVA LÍNEA
import configRoutes from './routes/config.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import opportunityRoutes from './routes/opportunities.js';
import stageRoutes from './routes/pipelineStages.js';
import tagRoutes from './routes/tags.js'; // <-- NUEVA LÍNEA
import opportunityMembersRoutes from './routes/opportunityMembers.js';
import checklistItemsRoutes from './routes/checklistItems.js';
import activitiesRoutes from './routes/activities.js';


// --- CONFIGURACIÓN DEL SERVIDOR ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- REGISTRO DE RUTAS DE LA API ---
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/dashboard', dashboardRoutes); // <-- NUEVA LÍNEA
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/stages', stageRoutes); // <-- Asegurándonos de que esta línea esté aquí
app.use('/api/tags', tagRoutes); // <-- NUEVA LÍNEA
app.use('/api/opportunities/:opportunityId/members', opportunityMembersRoutes);
app.use('/api', checklistItemsRoutes);
app.use('/api/opportunities/:opportunityId/activities', activitiesRoutes);

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});