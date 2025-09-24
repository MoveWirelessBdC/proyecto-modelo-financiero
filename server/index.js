

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
import portfolioRoutes from './routes/portfolio.js';
import configRoutes from './routes/config.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import opportunityRoutes from './routes/opportunities.js';
import stageRoutes from './routes/pipelineStages.js';
import tagRoutes from './routes/tags.js';
import salesRoutes from './routes/sales.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/sales', salesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});