import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Import routes
import authRouter from './routes/auth.js';
import configRouter from './routes/config.js';
import clientsRouter from './routes/clients.js';
import projectsRouter from './routes/projects.js';
import portfolioRouter from './routes/portfolio.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/config', configRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/portfolio', portfolioRouter);

// Health check route
app.get('/', (req, res) => {
    res.send('Fintech Pro Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
