    // server/routes/portfolio.js
    import express from 'express';
    import pool from '../db/index.js';
    import { authMiddleware, checkPermission } from '../middleware/auth.js';

    const router = express.Router();

    // GET all assets
    router.get('/assets', [authMiddleware, checkPermission('portfolio:view')], async (req, res) => {
        try {
            const assets = await pool.query('SELECT * FROM portfolio_assets ORDER BY purchase_date DESC');
            res.json(assets.rows);
        } catch (err) { console.error(err); res.status(500).send('Server Error'); }
    });

    // ADD a new asset
    router.post('/assets', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => {
        try {
            const { name, ticker_symbol, purchase_value, purchase_date } = req.body;
            const newAsset = await pool.query(
                'INSERT INTO portfolio_assets (name, ticker_symbol, purchase_value, purchase_date, current_market_value, last_updated) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
                [name, ticker_symbol, purchase_value, purchase_date, purchase_value] // El valor actual es el mismo que el de compra inicialmente
            );
            res.status(201).json(newAsset.rows[0]);
        } catch (err) { console.error(err); res.status(500).send('Server Error'); }
    });

    // UPDATE an asset's market value
    router.put('/assets/:id', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => {
        // ... (código para actualizar, lo implementaremos después)
    });

    // DELETE an asset
    router.delete('/assets/:id', [authMiddleware, checkPermission('portfolio:delete')], async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM portfolio_assets WHERE id = $1', [id]);
            res.status(204).send();
        } catch (err) { console.error(err); res.status(500).send('Server Error'); }
    });

    // La ruta de overview no cambia
    router.get('/overview', authMiddleware, async (req, res) => {
        try {
            // 1. Valor total del portafolio de colateral
            const portfolioValueResult = await pool.query('SELECT SUM(current_market_value) as total_market_value FROM portfolio_assets');
            const totalMarketValue = parseFloat(portfolioValueResult.rows[0].total_market_value) || 0;

            // 2. Deuda total activa
            const totalDebtResult = await pool.query('SELECT SUM(r.remaining_balance) as total_debt FROM (SELECT project_id, MAX(remaining_balance) as remaining_balance FROM amortization_schedule WHERE status = \'Pending\' GROUP BY project_id) as r');
            const totalDebt = parseFloat(totalDebtResult.rows[0].total_debt) || 0;

            // 3. Ingresos por interés este mes
            const interestIncomeResult = await pool.query(`
                SELECT SUM(interest) as interest_this_month
                FROM amortization_schedule
                WHERE status = 'Paid' AND to_char(payment_date, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')
            `);
            const interestIncomeThisMonth = parseFloat(interestIncomeResult.rows[0].interest_this_month) || 0;

            // 4. Pagos pendientes este mes
            const pendingPaymentsResult = await pool.query(`
                SELECT COUNT(*) as pending_payments
                FROM amortization_schedule
                WHERE status = 'Pending' AND to_char(payment_date, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')
            `);
            const pendingPaymentsThisMonth = parseInt(pendingPaymentsResult.rows[0].pending_payments, 10) || 0;

            // 5. Loan-to-Value (LTV)
            const ltv = totalMarketValue > 0 ? (totalDebt / totalMarketValue) * 100 : 0;

            res.json({
                totalMarketValue: totalMarketValue.toFixed(2),
                totalDebt: totalDebt.toFixed(2),
                interestIncomeThisMonth: interestIncomeThisMonth.toFixed(2),
                pendingPaymentsThisMonth,
                ltv: ltv.toFixed(2)
            });

        } catch (err) {
            console.error('Error fetching dashboard overview:', err);
            res.status(500).send('Server Error');
        }
    });

    export default router;
    