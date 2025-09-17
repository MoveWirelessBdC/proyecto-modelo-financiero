// server/routes/dashboard.js
import express from 'express';
import pool from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware para todas las rutas de este archivo
router.use(authMiddleware);

/**
 * GET /api/dashboard/sales-funnel
 * Devuelve los datos para el embudo de ventas.
 */
router.get('/sales-funnel', async (req, res) => {
    try {
        // 1. Oportunidades Creadas (valor total de todas las oportunidades)
        const opportunitiesRes = await pool.query(
            "SELECT COALESCE(SUM(potential_amount), 0) as total_value FROM opportunities WHERE stage_id NOT IN (SELECT id FROM pipeline_stages WHERE name ILIKE '%perdido%')"
        );

        // 2. Proyectos Ganados (valor total de proyectos activos)
        // Asumimos que una oportunidad ganada se convierte en un proyecto 'Activo'
        const wonProjectsRes = await pool.query(
            "SELECT COALESCE(SUM(amount), 0) as total_value FROM projects WHERE status = 'Activo'"
        );

        // 3. Pendientes de Aprobación (simulado por ahora, se puede ajustar con la lógica de negocio)
        // Por ejemplo, podríamos considerar oportunidades en la etapa 'Negociación'
        const pendingApprovalRes = await pool.query(
            "SELECT COALESCE(SUM(o.potential_amount), 0) as total_value FROM opportunities o JOIN pipeline_stages s ON o.stage_id = s.id WHERE s.name = 'Negociación'"
        );

        const funnelData = {
            opportunitiesCreated: parseFloat(opportunitiesRes.rows[0].total_value),
            pendingApproval: parseFloat(pendingApprovalRes.rows[0].total_value),
            projectsWon: parseFloat(wonProjectsRes.rows[0].total_value),
        };

        res.json(funnelData);
    } catch (err) {
        console.error('Error fetching sales funnel data:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;