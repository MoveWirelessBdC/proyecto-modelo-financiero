import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// --- Portfolio Assets --- //
// ... (El resto de las rutas de assets, transactions, etc. no necesitan cambios, las dejamos como están)
router.get('/assets', [authMiddleware, checkPermission('portfolio:view')], async (req, res) => { /* ... */ });
router.post('/assets', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => { /* ... */ });
router.put('/assets/:id', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => { /* ... */ });
router.delete('/assets/:id', [authMiddleware, checkPermission('portfolio:delete')], async (req, res) => { /* ... */ });
router.get('/transactions', [authMiddleware, checkPermission('portfolio:view')], async (req, res) => { /* ... */ });
router.post('/transactions', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => { /* ... */ });


// --- Portfolio Overview (VERSIÓN CON DIAGNÓSTICO) --- //

router.get('/overview', authMiddleware, async (req, res) => {
    console.log('\n--- [INFO] Petición recibida para /api/portfolio/overview ---');
    try {
        // 1. Calcular Valor Total de Activos
        console.log('[PASO 1] Calculando valor total de activos...');
        const assetsValue = await pool.query('SELECT SUM(current_market_value) as total_value FROM portfolio_assets');
        const totalMarketValue = parseFloat(assetsValue.rows[0].total_value) || 0;
        console.log(`  -> Resultado: ${totalMarketValue}`);

        // 2. Calcular Deuda Total
        console.log('[PASO 2] Calculando deuda total...');
        const debtResult = await pool.query(`
            SELECT SUM(p.amount) - COALESCE(SUM(paid.principal_paid), 0) AS total_debt
            FROM projects p
            LEFT JOIN (
                SELECT project_id, SUM(principal) as principal_paid
                FROM amortization_schedule
                WHERE status = 'Paid'
                GROUP BY project_id
            ) paid ON p.id = paid.project_id
        `);
        const totalDebt = parseFloat(debtResult.rows[0].total_debt) || 0;
        console.log(`  -> Resultado: ${totalDebt}`);

        // 3. Calcular LTV
        console.log('[PASO 3] Calculando LTV...');
        const ltv = totalMarketValue > 0 ? (totalDebt / totalMarketValue) * 100 : 0;
        console.log(`  -> Resultado: ${ltv}`);

        // 4. Calcular otros KPIs
        console.log('[PASO 4] Calculando otros KPIs (ingresos y pagos pendientes)...');
        const interestIncome = await pool.query("SELECT SUM(interest) as monthly_interest FROM amortization_schedule WHERE payment_date >= date_trunc('month', CURRENT_DATE) AND payment_date < date_trunc('month', CURRENT_DATE) + interval '1 month' AND status = 'Paid'");
        const pendingPayments = await pool.query("SELECT COUNT(*) as count FROM amortization_schedule WHERE payment_date >= date_trunc('month', CURRENT_DATE) AND payment_date < date_trunc('month', CURRENT_DATE) + interval '1 month' AND status = 'Pending'");
        console.log('  -> KPIs calculados.');

        console.log('--- [SUCCESS] Cálculo completado. Enviando respuesta al frontend. ---');
        res.json({
            totalMarketValue: totalMarketValue.toFixed(2),
            totalDebt: totalDebt.toFixed(2),
            ltv: ltv.toFixed(2),
            interestIncomeThisMonth: (parseFloat(interestIncome.rows[0].monthly_interest) || 0).toFixed(2),
            pendingPaymentsThisMonth: parseInt(pendingPayments.rows[0].count) || 0
        });

    } catch (err) {
        // ESTA PARTE ES LA MÁS IMPORTANTE
        console.error('\n--- [ERROR] ¡Ocurrió un error en la ruta /overview! ---');
        console.error('Error detallado:', err); // Esto nos dará toda la información del error
        res.status(500).send('Server Error');
    }
});

export default router;