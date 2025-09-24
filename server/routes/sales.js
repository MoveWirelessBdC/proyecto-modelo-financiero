import express from 'express';
import pool from '../db/index.js'; // Usamos el pool de pg directamente
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/sales/pipeline
 * Devuelve el valor total de las oportunidades agrupadas por su etapa.
 * Esto alimenta el gráfico de embudo de ventas.
 */
router.get('/pipeline', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                ps.name,
                COALESCE(SUM(o.potential_amount), 0) as value
            FROM pipeline_stages ps
            LEFT JOIN opportunities o ON ps.id = o.stage_id
            WHERE ps.is_archived = false
            GROUP BY ps.id, ps.name
            ORDER BY ps.stage_order;
        `;
        const { rows } = await pool.query(query);

        // Damos un formato más amigable para el gráfico de Recharts
        const formattedPipeline = rows.map(stage => ({
            name: stage.name,
            value: parseFloat(stage.value),
        }));

        res.json(formattedPipeline);
    } catch (error) {
        console.error('Error fetching sales pipeline:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el pipeline de ventas.' });
    }
});

/**
 * GET /api/sales/performance-by-salesperson
 * Devuelve la suma del valor de las oportunidades ACTIVAS agrupadas por vendedor.
 * Esto alimenta el gráfico de barras de rendimiento comercial.
 */
router.get('/performance-by-salesperson', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT
                u.nombre_completo as name,
                COALESCE(SUM(o.potential_amount), 0) as value
            FROM users u
            LEFT JOIN opportunities o ON u.id = o.owner_id
            JOIN pipeline_stages ps ON o.stage_id = ps.id
            WHERE ps.name NOT IN ('Cerrado-Ganado', 'Cerrado-Perdido') AND ps.is_archived = false
            GROUP BY u.id, u.nombre_completo
            ORDER BY value DESC;
        `;
        const { rows } = await pool.query(query);

        // Formato para Recharts
        const formattedPerformance = rows.map(item => ({
            name: item.name,
            value: parseFloat(item.value),
        }));

        res.json(formattedPerformance);
    } catch (error) {
        console.error('Error fetching performance by salesperson:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el rendimiento por vendedor.' });
    }
});

export default router;
